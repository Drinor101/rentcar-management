-- Add is_paid column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS is_paid BOOLEAN DEFAULT false;

-- Update existing bookings to have is_paid = false by default
UPDATE public.bookings SET is_paid = false WHERE is_paid IS NULL;

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to include is_paid
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
  b.is_paid,
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
