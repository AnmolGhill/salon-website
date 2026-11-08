-- Raju Hair Salon bookings for Cloudflare D1.
-- Local:  npx wrangler d1 execute salon-bookings --local --file=./schema.sql
-- Remote: npx wrangler d1 execute salon-bookings --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  appointment_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'CONFIRMED',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS booking_slots (
  appointment_date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  booking_id INTEGER NOT NULL,
  PRIMARY KEY (appointment_date, time_slot)
);

CREATE INDEX IF NOT EXISTS idx_booking_slots_booking
  ON booking_slots (booking_id);

CREATE INDEX IF NOT EXISTS idx_bookings_date
  ON bookings (appointment_date);
