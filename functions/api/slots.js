import { salon } from '../../shared/salon.js'
import { buildSlotView } from '../../shared/booking.js'
import { json } from '../lib/http.js'

export async function onRequestGet({ request, env }) {
  if (!env.DB) {
    return json({ ok: false, error: 'Booking storage is not configured yet.' }, 503)
  }

  const url = new URL(request.url)
  const date = url.searchParams.get('date')?.trim() || ''
  const service = url.searchParams.get('service')?.trim() || ''
  const probe = buildSlotView({
    salon,
    dateISO: date,
    serviceName: service,
    bookedTimes: [],
  })

  if (!probe.ok) {
    return json({ ok: false, error: probe.error, slots: [] }, 400)
  }
  if (probe.closed) {
    return json({ ok: true, closed: true, error: probe.error, slots: [] })
  }

  try {
    const rows = await env.DB.prepare(
      'SELECT time_slot FROM booking_slots WHERE appointment_date = ?',
    ).bind(date).all()
    const bookedTimes = (rows.results || []).map((row) => row.time_slot)
    const plan = buildSlotView({
      salon,
      dateISO: date,
      serviceName: service,
      bookedTimes,
    })
    return json({
      ok: true,
      closed: false,
      error: '',
      slots: plan.slots,
      slotCount: plan.slotCount,
    })
  } catch (error) {
    console.error('Slot lookup failed', error?.message || error)
    return json({
      ok: false,
      error: 'Appointment times are unavailable until the booking database is ready.',
    }, 503)
  }
}
