-- Add daily_rate_at_booking column to bookings table
-- This stores the daily rate of the car at the time of booking creation
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS daily_rate_at_booking NUMERIC(10, 2);

-- Update existing bookings to use current car daily_rate
UPDATE public.bookings b
SET daily_rate_at_booking = c.daily_rate
FROM cars c
WHERE b.car_id = c.id AND b.daily_rate_at_booking IS NULL;

-- For any remaining bookings without daily_rate_at_booking, set to 0
-- (This handles edge cases where car might be deleted)
UPDATE public.bookings
SET daily_rate_at_booking = 0
WHERE daily_rate_at_booking IS NULL;

-- Set NOT NULL constraint after updating existing data
ALTER TABLE public.bookings
ALTER COLUMN daily_rate_at_booking SET NOT NULL;

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to use daily_rate_at_booking instead of current car daily_rate
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
  b.daily_rate_at_booking AS daily_rate,
  b.discount,
  b.total_amount,
  b.is_paid,
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
