export async function sendBookingNotification(env, booking) {
  const token = env.TELEGRAM_BOT_TOKEN
  const chatId = env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    const error = new Error('Telegram is not configured')
    error.code = 'CONFIG'
    throw error
  }

  const lines = [
    'NEW SALON APPOINTMENT',
    '',
    `Booking ID: ${booking.id}`,
    `Customer: ${booking.customer}`,
    `Phone: ${booking.phone}`,
    `Service: ${booking.service}`,
    `Date: ${booking.date}`,
    `Time: ${booking.time}`,
    'Status: CONFIRMED',
  ]
  if (booking.note) {
    lines.push('', `Note: ${booking.note}`)
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: lines.join('\n'),
      disable_web_page_preview: true,
    }),
  })

  let payload
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.ok) {
    const error = new Error('Telegram API failed')
    error.code = 'TELEGRAM'
    error.detail = payload?.description || `HTTP ${response.status}`
    throw error
  }
}
