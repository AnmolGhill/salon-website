# Raju Hair Salon

Premium booking site for Raju Hair Salon. The React app is built with Vite. Appointment storage and Telegram alerts run as Cloudflare Pages Functions in this same repository. Bot tokens stay in Cloudflare secrets, never in the frontend.

Edit salon name, prices, hours, address, and phone in `shared/salon.js`. Service names are shared by the form, the slot API, and the database.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173. `npm run dev` serves the site and the `/api/slots` and `/api/booking` functions. Bookings are stored in `.data/bookings.sqlite`, using the same function code that production runs on Cloudflare D1.

Copy `.dev.vars.example` to `.dev.vars` and set a real bot token and chat id before confirming an appointment. Without those secrets the booking is refused and nothing is saved. `.dev.vars` is gitignored.

```bash
npm run check
npm run lint
npm run build
```

`npm run check` confirms validation, closing day, slot length, duplicate protection, and the Telegram failure path.

To run against Cloudflare’s local D1 instead of the dev SQLite file:

```bash
npx wrangler d1 execute salon-bookings --local --file=./schema.sql
npm run pages:dev
```

## Deploy on Cloudflare Pages

1. Push this repository to GitHub.
2. In the Cloudflare dashboard, create a Pages project from that repository.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Node.js version: 22 (`.node-version` already requests it)
6. The `/functions` directory is picked up automatically. Do not upload only the `dist` folder by hand unless you also deploy with Wrangler from the project root.

Create the database and apply the schema:

```bash
npx wrangler d1 create salon-bookings
```

Copy the returned `database_id` into `wrangler.toml`, replacing the placeholder. Then:

```bash
npx wrangler d1 execute salon-bookings --remote --file=./schema.sql
```

In the Pages project, confirm the D1 binding name is `DB`.

## Telegram

1. In Telegram, open [@BotFather](https://t.me/BotFather) and send `/newbot`.
2. Copy the bot token.
3. Send any message to your new bot.
4. Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy the numeric `chat.id`. That is the salon owner’s chat.
5. Store both values as Pages secrets. Do not put them in Vite env files or React code.

```bash
npx wrangler pages secret put TELEGRAM_BOT_TOKEN
npx wrangler pages secret put TELEGRAM_CHAT_ID
```

For local confirmation, put the same two values in `.dev.vars`.

A confirmed booking is saved, then the owner receives:

```text
NEW SALON APPOINTMENT

Booking ID: SAL-1001
Customer: Rahul Sharma
Phone: +91 9876543210
Service: Haircut
Date: 10 November 2026
Time: 04:30 PM
Status: CONFIRMED
```

If Telegram rejects the message, the slot is released and the guest sees an error instead of a success screen.

## Hours and slots

Opening hours, slot length, timezone, and the closed weekday live in `shared/salon.js`.

- Timezone: `Asia/Kolkata`
- Default hours: 10:00–20:00
- Slot length: 30 minutes
- Closed: Monday
- A longer service reserves the following slots so two guests cannot overlap

Direct deploy from this machine, after the database id and secrets are set:

```bash
npm run deploy
```
