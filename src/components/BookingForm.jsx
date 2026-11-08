import { useEffect, useId, useState } from 'react'
import { Check } from 'lucide-react'
import { salon, formatINR } from '../../shared/salon.js'
import {
  addDaysISO,
  hoursSummary,
  validateBookingPayload,
  zonedNow,
} from '../../shared/booking.js'
import SectionHeading from './SectionHeading.jsx'

const EMPTY = {
  name: '',
  phone: '',
  date: '',
  time: '',
  message: '',
  website: '',
}

async function readJson(response) {
  try {
    return await response.json()
  } catch {
    return null
  }
}

export default function BookingForm({ selectedService, onServiceChange }) {
  const formId = useId()
  const summary = hoursSummary(salon)
  const today = zonedNow(salon.hours.timeZone).iso
  const latest = addDaysISO(today, salon.bookingWindowDays)
  const [fields, setFields] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [slots, setSlots] = useState([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsMessage, setSlotsMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [trackedService, setTrackedService] = useState(selectedService)

  if (selectedService !== trackedService) {
    setTrackedService(selectedService)
    setFields((current) => ({ ...current, time: '' }))
    setSlots([])
    setSlotsMessage('')
    setSlotsLoading(Boolean(selectedService && fields.date))
  }

  useEffect(() => {
    if (!selectedService || !fields.date) {
      return undefined
    }

    const controller = new AbortController()
    const params = new URLSearchParams({ date: fields.date, service: selectedService })

    fetch(`/api/slots?${params}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await readJson(response)
        if (response.status === 404) {
          throw new Error('The booking service is not running. Use npm run dev, or npm run pages:dev for the Cloudflare runtime.')
        }
        if (!response.ok || !data?.ok) {
          throw new Error(data?.error || 'Unable to load appointment times.')
        }
        return data
      })
      .then((data) => {
        setSlots(data.slots || [])
        setSlotsMessage(data.closed ? data.error : '')
        setFormError('')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setSlots([])
        setSlotsMessage(error.message || 'Unable to load appointment times.')
      })
      .finally(() => {
        if (!controller.signal.aborted) setSlotsLoading(false)
      })

    return () => controller.abort()
  }, [selectedService, fields.date])

  function update(name, value) {
    setFields((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function updateDate(value) {
    setFields((current) => ({ ...current, date: value, time: '' }))
    setErrors((current) => ({ ...current, date: '', time: '' }))
    setSlots([])
    setSlotsMessage('')
    if (selectedService && value) setSlotsLoading(true)
  }

  function chooseService(value) {
    onServiceChange(value)
    setErrors((current) => ({ ...current, service: '', time: '' }))
    setSlots([])
    setSlotsMessage('')
    if (value && fields.date) setSlotsLoading(true)
  }

  async function refreshSlots() {
    if (!selectedService || !fields.date) return
    setSlotsLoading(true)
    const params = new URLSearchParams({ date: fields.date, service: selectedService })
    try {
      const response = await fetch(`/api/slots?${params}`)
      const data = await readJson(response)
      if (!response.ok || !data?.ok) throw new Error(data?.error || 'Unable to load appointment times.')
      setSlots(data.slots || [])
      setSlotsMessage(data.closed ? data.error : '')
    } catch (error) {
      setSlotsMessage(error.message)
    } finally {
      setSlotsLoading(false)
    }
  }

  async function onSubmit(event) {
    event.preventDefault()
    setFormError('')
    const validation = validateBookingPayload({
      ...fields,
      service: selectedService,
      bookedTimes: slots.filter((slot) => slot.state !== 'available').map((slot) => slot.time),
    }, salon)

    const nextErrors = { ...validation.errors }
    const selected = slots.find((slot) => slot.time === fields.time)
    if (fields.time && selected && selected.state !== 'available') {
      nextErrors.time = 'That time slot is no longer available.'
    }
    if (!fields.time) nextErrors.time = 'Choose an available time slot.'

    if (Object.values(nextErrors).some(Boolean) || !validation.ok) {
      setErrors(nextErrors)
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: fields.name,
          phone: fields.phone,
          service: selectedService,
          date: fields.date,
          time: fields.time,
          message: fields.message,
          website: fields.website,
        }),
      })
      const data = await readJson(response)
      if (!response.ok || !data?.ok) {
        if (response.status === 409) await refreshSlots()
        throw new Error(data?.error || 'We could not confirm the appointment.')
      }
      setConfirmation(data.booking)
      setFields(EMPTY)
      setSlots([])
    } catch (error) {
      setFormError(error.message || 'We could not confirm the appointment.')
    } finally {
      setSubmitting(false)
    }
  }

  function bookAnother() {
    setConfirmation(null)
    setFormError('')
    setErrors({})
  }

  const errorText = (name) => errors[name] || ''

  return (
    <section className="section" id="booking">
      <div className="container booking-layout">
        <div className="booking-intro">
          <SectionHeading
            index="04"
            eyebrow="Appointment"
            title="Reserve the chair."
            text="Tell us who is coming, which service, and when. We hold the time only after the salon has the booking."
          />
          <p className="booking-note">
            {summary.openDays}, {summary.hours}. Closed {summary.closedDays}.
            Times are shown in India Standard Time, in {salon.hours.slotMinutes}-minute starts.
            A longer service holds the following slots so two guests are never booked on top of each other.
          </p>
          <p className="booking-note">
            Prefer to talk? Call <a href={`tel:${salon.phoneTel}`}>{salon.phoneDisplay}</a> or message us on WhatsApp.
          </p>
        </div>

        <div className="booking-card">
          {confirmation ? (
            <div className="success" role="status">
              <div className="success-mark" aria-hidden="true"><Check size={30} /></div>
              <h3>You’re booked.</h3>
              <p className="lede">The salon has the appointment. A confirmation was sent to the owner.</p>
              <dl className="success-list">
                <div><dt>Booking ID</dt><dd>{confirmation.id}</dd></div>
                <div><dt>Guest</dt><dd>{confirmation.customer}</dd></div>
                <div><dt>Phone</dt><dd>{confirmation.phone}</dd></div>
                <div><dt>Service</dt><dd>{confirmation.service}</dd></div>
                <div><dt>Date</dt><dd>{confirmation.date}</dd></div>
                <div><dt>Time</dt><dd>{confirmation.time}</dd></div>
                <div><dt>Status</dt><dd>{confirmation.status}</dd></div>
              </dl>
              <button className="btn btn-gold" type="button" onClick={bookAnother}>Book another</button>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="form-grid">
                <label className="field" htmlFor={`${formId}-name`}>
                  <span>Full name</span>
                  <input
                    id={`${formId}-name`}
                    name="name"
                    autoComplete="name"
                    value={fields.name}
                    onChange={(event) => update('name', event.target.value)}
                    aria-invalid={Boolean(errorText('name'))}
                    disabled={submitting}
                  />
                  {errorText('name') ? <small className="field-error">{errorText('name')}</small> : null}
                </label>

                <label className="field" htmlFor={`${formId}-phone`}>
                  <span>Mobile number</span>
                  <div className="phone-input">
                    <em>+91</em>
                    <input
                      id={`${formId}-phone`}
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={14}
                      placeholder="9876543210"
                      value={fields.phone}
                      onChange={(event) => update('phone', event.target.value.replace(/[^\d]/g, '').slice(0, 12))}
                      aria-invalid={Boolean(errorText('phone'))}
                      disabled={submitting}
                    />
                  </div>
                  {errorText('phone') ? <small className="field-error">{errorText('phone')}</small> : null}
                </label>

                <label className="field" htmlFor={`${formId}-service`}>
                  <span>Service</span>
                  <select
                    id={`${formId}-service`}
                    name="service"
                    value={selectedService}
                    onChange={(event) => chooseService(event.target.value)}
                    aria-invalid={Boolean(errorText('service'))}
                    disabled={submitting}
                  >
                    <option value="">Select a service</option>
                    {salon.services.map((service) => (
                      <option key={service.id} value={service.name}>
                        {service.name} · {formatINR(service.price)}
                      </option>
                    ))}
                  </select>
                  {errorText('service') ? <small className="field-error">{errorText('service')}</small> : null}
                </label>

                <label className="field" htmlFor={`${formId}-date`}>
                  <span>Appointment date</span>
                  <input
                    id={`${formId}-date`}
                    name="date"
                    type="date"
                    min={today}
                    max={latest}
                    value={fields.date}
                    onChange={(event) => updateDate(event.target.value)}
                    aria-invalid={Boolean(errorText('date'))}
                    disabled={submitting}
                  />
                  {errorText('date') ? <small className="field-error">{errorText('date')}</small> : null}
                </label>

                <fieldset className="field" style={{ border: 0, margin: 0, padding: 0 }}>
                  <legend className="slot-label">Available time slot</legend>
                  {!selectedService || !fields.date ? (
                    <p className="helper">Select a service and a date to see open times.</p>
                  ) : null}
                  {slotsLoading ? <p className="helper">Checking the chair…</p> : null}
                  {slotsMessage ? <p className="field-error">{slotsMessage}</p> : null}
                  {slots.length > 0 ? (
                    <div className="slots" role="listbox" aria-label="Available time slots">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          className={`slot ${fields.time === slot.time ? 'is-selected' : ''}`}
                          aria-pressed={fields.time === slot.time}
                          disabled={slot.state !== 'available' || submitting}
                          onClick={() => update('time', slot.time)}
                        >
                          {slot.label}
                          {slot.state === 'booked' ? <small>Booked</small> : null}
                          {slot.state === 'past' ? <small>Passed</small> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                  {!slotsLoading && selectedService && fields.date && !slotsMessage && slots.length > 0 && slots.every((slot) => slot.state !== 'available') ? (
                    <p className="helper">No open times remain on this date. Please choose another day.</p>
                  ) : null}
                  {errorText('time') ? <small className="field-error">{errorText('time')}</small> : null}
                </fieldset>

                <label className="field" htmlFor={`${formId}-message`}>
                  <span>Message, optional</span>
                  <textarea
                    id={`${formId}-message`}
                    name="message"
                    maxLength={400}
                    value={fields.message}
                    onChange={(event) => update('message', event.target.value)}
                    placeholder="Anything the stylist should know"
                    disabled={submitting}
                  />
                  {errorText('message') ? <small className="field-error">{errorText('message')}</small> : null}
                </label>

                <label className="hp" aria-hidden="true">
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={fields.website}
                    onChange={(event) => update('website', event.target.value)}
                  />
                </label>

                {formError ? <p className="form-alert" role="alert">{formError}</p> : null}

                <button className="btn btn-gold btn-block" type="submit" disabled={submitting}>
                  {submitting ? <span className="spinner" aria-hidden="true" /> : null}
                  {submitting ? 'Confirming…' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
