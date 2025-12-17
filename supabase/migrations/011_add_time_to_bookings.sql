-- Add pick_up_time and return_time columns to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS pick_up_time TIME;
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS return_time TIME;

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to include times
CREATE VIEW reports AS
SELECT 
  b.id,
  b.car_id,
  c.make AS car_make,
  c.model AS car_model,
  b.client_name,
  b.client_phone,
  b.client_email,
  b.start_date,
  b.pick_up_time,
  b.end_date,
  b.return_time,
  (b.end_date - b.start_date + 1)::INTEGER AS days,
  c.daily_rate,
  b.discount,
  b.total_amount,
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
