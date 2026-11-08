import { createLocalD1 } from '../dev/local-d1.js'
import { onRequestGet } from '../functions/api/slots.js'
import { onRequestPost } from '../functions/api/booking.js'

const failures = []
function assert(condition, message) {
  if (condition) console.log(`ok  ${message}`)
  else {
    failures.push(message)
    console.error(`FAIL  ${message}`)
  }
}

const db = createLocalD1(':memory:')
let telegramMode = 'ok'
let lastText = ''

globalThis.fetch = async (url, init) => {
  if (!String(url).includes('api.telegram.org')) {
    throw new Error(`Unexpected fetch ${url}`)
  }
  lastText = JSON.parse(init.body).text
  if (telegramMode === 'fail') {
    return Response.json({ ok: false, description: 'chat not found' }, { status: 400 })
  }
  return Response.json({ ok: true, result: { message_id: 1 } })
}

function env(overrides = {}) {
  return {
    DB: db,
    TELEGRAM_BOT_TOKEN: 'test-token',
    TELEGRAM_CHAT_ID: '100',
    ...overrides,
  }
}

async function post(body, overrides) {
  const request = new Request('http://localhost/api/booking', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  const response = await onRequestPost({ request, env: env(overrides) })
  return { status: response.status, data: await response.json() }
}

async function slots(date, service) {
  const request = new Request(`http://localhost/api/slots?date=${date}&service=${encodeURIComponent(service)}`)
  const response = await onRequestGet({ request, env: env() })
  return { status: response.status, data: await response.json() }
}

const guest = {
  name: 'Rahul Sharma',
  phone: '9876543210',
  service: 'Haircut',
  date: '2026-11-10',
  time: '16:30',
  message: 'Window seat if possible',
}

const badPhone = await post({ ...guest, phone: '12345' })
assert(badPhone.status === 400, 'rejects an invalid Indian mobile number')

const past = await post({ ...guest, date: '2026-11-01', time: '11:00' })
assert(past.status === 400, 'rejects a past date')

const honeypot = await post({ ...guest, time: '11:00', website: 'https://spam.example' })
assert(honeypot.status === 400, 'rejects the hidden honeypot field')

const closed = await slots('2026-11-09', 'Haircut')
assert(closed.status === 200 && closed.data.closed === true, 'Monday is closed in Asia/Kolkata')

const open = await slots('2026-11-10', 'Hair Coloring')
const coloring = open.data.slots.filter((slot) => slot.state === 'available').map((slot) => slot.time)
assert(open.status === 200 && coloring.includes('18:30') && !coloring.includes('19:00'), 'a 90 minute service cannot start too late')

const first = await post(guest)
assert(first.status === 200 && first.data.booking.id === 'SAL-1001', 'first booking id is SAL-1001')
assert(first.data.booking.status === 'CONFIRMED', 'status is CONFIRMED')
assert(lastText.includes('NEW SALON APPOINTMENT'), 'Telegram text has the heading')
assert(lastText.includes('Booking ID: SAL-1001'), 'Telegram text has the booking id')
assert(lastText.includes('Customer: Rahul Sharma'), 'Telegram text has the customer')
assert(lastText.includes('Phone: +91 9876543210'), 'Telegram text has the phone')
assert(lastText.includes('Service: Haircut'), 'Telegram text has the service')
assert(lastText.includes('Date: 10 November 2026'), 'Telegram text has the date')
assert(lastText.includes('Time: 04:30 PM'), 'Telegram text has the time')
assert(lastText.includes('Status: CONFIRMED'), 'Telegram text has the status')
assert(!lastText.includes('test-token'), 'Telegram request body does not echo the bot token')

const duplicate = await post(guest)
assert(duplicate.status === 400 || duplicate.status === 409, 'the same slot cannot be booked twice')

const overlap = await post({ ...guest, name: 'Neha Kapoor', phone: '9123456780', time: '17:00' })
assert(overlap.status === 400 || overlap.status === 409, 'a following slot held by the haircut stays blocked')

const later = await post({ ...guest, name: 'Neha Kapoor', phone: '9123456780', time: '17:30' })
assert(later.status === 200 && /^SAL-\d+$/.test(later.data.booking.id), 'the next free slot confirms with a booking id')

const [raceA, raceB] = await Promise.all([
  post({ ...guest, name: 'Asha Menon', phone: '9988776655', time: '12:00' }),
  post({ ...guest, name: 'Kabir Joshi', phone: '9090909090', time: '12:00' }),
])
const raceStatuses = [raceA.status, raceB.status].sort()
assert(raceStatuses[0] === 200 && raceStatuses[1] === 409, 'simultaneous bookings keep a single winner')

telegramMode = 'fail'
const failedNotice = await post({ ...guest, name: 'Ira Sen', phone: '9765432109', time: '11:00' })
assert(failedNotice.status === 502, 'a Telegram failure does not confirm the appointment')
const afterFailure = await slots('2026-11-10', 'Haircut')
const eleven = afterFailure.data.slots.find((slot) => slot.time === '11:00')
assert(eleven?.state === 'available', 'the slot is released when Telegram fails')

const unconfigured = await post(
  { ...guest, name: 'Dev Shah', phone: '9654321098', time: '10:30' },
  { TELEGRAM_BOT_TOKEN: undefined, TELEGRAM_CHAT_ID: undefined },
)
assert(unconfigured.status === 503, 'missing Telegram secrets do not confirm a booking')

if (failures.length) {
  console.error(`\n${failures.length} check(s) failed.`)
  process.exit(1)
}
console.log('\nAll booking checks passed.')
