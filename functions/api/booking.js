import { salon } from '../../shared/salon.js'
import { validateBookingPayload } from '../../shared/booking.js'
import { isConflict, json } from '../lib/http.js'
import { sendBookingNotification } from '../lib/telegram.js'

async function releaseBooking(db, bookingId) {
  await db.batch([
    db.prepare('DELETE FROM booking_slots WHERE booking_id = ?').bind(bookingId),
    db.prepare('DELETE FROM bookings WHERE id = ?').bind(bookingId),
  ])
}

export async function onRequestPost({ request, env }) {
  if (!env.DB) {
    return json({ ok: false, error: 'Booking storage is not configured yet.' }, 503)
  }
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    return json({
      ok: false,
      error: 'Appointment confirmations are not configured yet. Please call the salon or message us on WhatsApp.',
    }, 503)
  }

  const contentType = request.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    return json({ ok: false, error: 'Send the booking as JSON.' }, 415)
  }

  let raw
  try {
    raw = await request.text()
  } catch {
    return json({ ok: false, error: 'Invalid booking request.' }, 400)
  }
  if (raw.length > 8000) {
    return json({ ok: false, error: 'That booking request is too large.' }, 413)
  }

  let body
  try {
    body = JSON.parse(raw)
  } catch {
    return json({ ok: false, error: 'Invalid booking request.' }, 400)
  }

  if (body?.website) {
    return json({ ok: false, error: 'Unable to submit the appointment.' }, 400)
  }

  let bookedTimes
  try {
    const existing = await env.DB.prepare(
      'SELECT time_slot FROM booking_slots WHERE appointment_date = ?',
    ).bind(String(body?.date ?? '').trim()).all()
    bookedTimes = (existing.results || []).map((row) => row.time_slot)
  } catch (error) {
    console.error('Availability lookup failed', error?.message || error)
    return json({
      ok: false,
      error: 'Appointment times are unavailable until the booking database is ready.',
    }, 503)
  }

  const result = validateBookingPayload({ ...body, bookedTimes }, salon)
  if (!result.ok) {
    const first = Object.values(result.errors)[0] || 'Please check the appointment form.'
    return json({ ok: false, error: first, fields: result.errors }, 400)
  }

  const { value } = result
  const tempCode = `TMP-${crypto.randomUUID()}`
  let bookingId
  try {
    const inserted = await env.DB.prepare(`
      INSERT INTO bookings (
        booking_code, customer_name, phone, service,
        appointment_date, time_slot, message, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', ?)
    `).bind(
      tempCode,
      value.name,
      value.phone,
      value.service,
      value.date,
      value.time,
      value.message || null,
      new Date().toISOString(),
    ).run()
    bookingId = inserted.meta?.last_row_id
  } catch (error) {
    console.error('Booking insert failed', error?.message || error)
    return json({ ok: false, error: 'We could not save the appointment. Please try again.' }, 500)
  }

  if (!bookingId) {
    await env.DB.prepare('DELETE FROM bookings WHERE booking_code = ?').bind(tempCode).run()
    return json({ ok: false, error: 'We could not save the appointment. Please try again.' }, 500)
  }

  const bookingCode = `SAL-${1000 + Number(bookingId)}`

  try {
    await env.DB.prepare('UPDATE bookings SET booking_code = ? WHERE id = ?').bind(bookingCode, bookingId).run()
    await env.DB.batch(value.occupied.map((slot) => (
      env.DB.prepare(
        'INSERT INTO booking_slots (appointment_date, time_slot, booking_id) VALUES (?, ?, ?)',
      ).bind(value.date, slot, bookingId)
    )))
  } catch (error) {
    await releaseBooking(env.DB, bookingId)
    if (isConflict(error)) {
      return json({
        ok: false,
        error: 'That time was just reserved. Please choose another slot.',
      }, 409)
    }
    console.error('Slot reserve failed', error?.message || error)
    return json({ ok: false, error: 'We could not reserve that time. Please try again.' }, 500)
  }

  const booking = {
    id: bookingCode,
    customer: value.name,
    phone: value.displayPhone,
    service: value.service,
    date: value.dateLabel,
    time: value.timeLabel,
    status: 'CONFIRMED',
    note: value.message,
  }

  try {
    await sendBookingNotification(env, booking)
  } catch (error) {
    await releaseBooking(env.DB, bookingId)
    console.error('Telegram notification failed', error.detail || error.message)
    const message = error.code === 'CONFIG'
      ? 'Appointment confirmations are not configured yet. Please call the salon or message us on WhatsApp.'
      : 'We could not confirm the appointment with the salon. Nothing was reserved. Please try again.'
    return json({ ok: false, error: message }, 502)
  }

  return json({
    ok: true,
    booking: {
      id: booking.id,
      customer: booking.customer,
      phone: booking.phone,
      service: booking.service,
      date: booking.date,
      time: booking.time,
      status: booking.status,
    },
  })
}
