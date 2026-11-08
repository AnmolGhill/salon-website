const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/

export function minutesFromTime(time) {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function timeFromMinutes(total) {
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function formatTimeLabel(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${suffix}`
}

export function formatDateLabel(iso) {
  const [year, month, day] = iso.split('-').map(Number)
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)))
}

export function addDaysISO(iso, days) {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function isRealISODate(iso) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function zonedNow(timeZone, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date)

  const read = (type) => parts.find((part) => part.type === type)?.value || ''
  let hour = Number(read('hour'))
  if (hour === 24) hour = 0

  return {
    iso: `${read('year')}-${read('month')}-${read('day')}`,
    minutes: hour * 60 + Number(read('minute')),
    weekday: WEEKDAY_INDEX[read('weekday')],
  }
}

export function weekdayIndex(iso, timeZone) {
  const [year, month, day] = iso.split('-').map(Number)
  const label = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(new Date(Date.UTC(year, month - 1, day, 12, 0, 0)))
  return WEEKDAY_INDEX[label]
}

export function generateStartTimes(openTime, closeTime, slotMinutes) {
  const start = minutesFromTime(openTime)
  const end = minutesFromTime(closeTime)
  const times = []
  for (let cursor = start; cursor + slotMinutes <= end; cursor += slotMinutes) {
    times.push(timeFromMinutes(cursor))
  }
  return times
}

export function findService(salonConfig, name) {
  return salonConfig.services.find((service) => service.name === name) || null
}

export function slotsNeeded(service, salonConfig) {
  return Math.max(1, Math.ceil(service.durationMinutes / salonConfig.hours.slotMinutes))
}

export function occupiedTimes(startTime, count, allTimes) {
  const index = allTimes.indexOf(startTime)
  if (index < 0) return null
  const range = allTimes.slice(index, index + count)
  return range.length === count ? range : null
}

export function closedWeekdayNames(salonConfig) {
  return salonConfig.hours.closedWeekdays.map((day) => WEEKDAYS[day])
}

export function hoursSummary(salonConfig) {
  const closed = new Set(salonConfig.hours.closedWeekdays)
  const openDays = WEEKDAYS.filter((_, index) => !closed.has(index))
  let openLabel = openDays.join(', ')
  if (openDays.length === 7) openLabel = 'Every day'
  if (closed.size === 1 && closed.has(1)) openLabel = 'Tuesday – Sunday'

  return {
    openDays: openLabel,
    closedDays: closedWeekdayNames(salonConfig).join(', ') || 'None',
    hours: `${formatTimeLabel(salonConfig.hours.open)} – ${formatTimeLabel(salonConfig.hours.close)}`,
  }
}

export function normalizeIndianMobile(raw) {
  let digits = String(raw ?? '').replace(/\D/g, '')
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2)
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1)
  return digits
}

export function normalizeName(raw) {
  return String(raw ?? '').replace(/\s+/g, ' ').trim()
}

export function buildSlotView({ salon: salonConfig, dateISO, serviceName, bookedTimes = [], now = new Date() }) {
  const zone = salonConfig.hours.timeZone
  const today = zonedNow(zone, now)
  const allTimes = generateStartTimes(
    salonConfig.hours.open,
    salonConfig.hours.close,
    salonConfig.hours.slotMinutes,
  )

  if (!isRealISODate(dateISO)) {
    return { ok: false, closed: false, error: 'Choose a valid appointment date.', slots: [] }
  }

  if (dateISO < today.iso) {
    return { ok: false, closed: false, error: 'Appointments cannot be booked in the past.', slots: [] }
  }

  const latest = addDaysISO(today.iso, salonConfig.bookingWindowDays)
  if (dateISO > latest) {
    return {
      ok: false,
      closed: false,
      error: `Appointments can be booked up to ${salonConfig.bookingWindowDays} days ahead.`,
      slots: [],
    }
  }

  const dayIndex = weekdayIndex(dateISO, zone)
  if (salonConfig.hours.closedWeekdays.includes(dayIndex)) {
    return {
      ok: true,
      closed: true,
      error: `The salon is closed on ${WEEKDAYS[dayIndex]}s. Please choose another date.`,
      slots: [],
    }
  }

  const service = findService(salonConfig, serviceName)
  if (!service) {
    return { ok: false, closed: false, error: 'Select a service to see available times.', slots: [] }
  }

  const count = slotsNeeded(service, salonConfig)
  const booked = bookedTimes instanceof Set ? bookedTimes : new Set(bookedTimes)
  const slots = allTimes
    .map((time) => {
      const range = occupiedTimes(time, count, allTimes)
      if (!range) return null
      const isPast = dateISO === today.iso && minutesFromTime(time) <= today.minutes
      let state = 'available'
      if (isPast) state = 'past'
      else if (range.some((slot) => booked.has(slot))) state = 'booked'
      return { time, label: formatTimeLabel(time), state }
    })
    .filter(Boolean)

  return { ok: true, closed: false, error: '', slots, slotCount: count }
}

export function validateBookingPayload(input, salonConfig, now = new Date()) {
  const errors = {}
  const name = normalizeName(input?.name)
  const phone = normalizeIndianMobile(input?.phone)
  const serviceName = String(input?.service ?? '').trim()
  const date = String(input?.date ?? '').trim()
  const time = String(input?.time ?? '').trim()
  const message = String(input?.message ?? '').replace(/\s+/g, ' ').trim()
  const service = findService(salonConfig, serviceName)

  if (name.length < 2 || name.length > 80 || !NAME_PATTERN.test(name)) {
    errors.name = 'Enter a full name using letters only.'
  }
  if (!/^[6-9]\d{9}$/.test(phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number.'
  }
  if (!service) errors.service = 'Select a service.'
  if (!date) errors.date = 'Choose an appointment date.'
  else if (!isRealISODate(date)) errors.date = 'Choose a valid appointment date.'
  if (!/^\d{2}:\d{2}$/.test(time)) errors.time = 'Choose an available time slot.'
  if (message.length > 400) errors.message = 'Please keep the message under 400 characters.'

  let occupied = null
  if (!errors.service && !errors.date && !errors.time) {
    const plan = buildSlotView({
      salon: salonConfig,
      dateISO: date,
      serviceName,
      bookedTimes: input?.bookedTimes || [],
      now,
    })
    if (!plan.ok || plan.closed) {
      errors.date = plan.error || 'That date is not available.'
    } else {
      const selected = plan.slots.find((slot) => slot.time === time)
      if (!selected || selected.state !== 'available') {
        errors.time = 'That time slot is no longer available.'
      } else {
        occupied = occupiedTimes(
          time,
          slotsNeeded(service, salonConfig),
          generateStartTimes(salonConfig.hours.open, salonConfig.hours.close, salonConfig.hours.slotMinutes),
        )
      }
    }
  }

  return {
    ok: Object.keys(errors).length === 0 && Boolean(occupied?.length),
    errors,
    value: {
      name,
      phone,
      service: serviceName,
      date,
      time,
      message,
      displayPhone: `+91 ${phone}`,
      dateLabel: isRealISODate(date) ? formatDateLabel(date) : '',
      timeLabel: /^\d{2}:\d{2}$/.test(time) ? formatTimeLabel(time) : '',
      occupied,
    },
  }
}
