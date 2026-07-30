-- Add child_seat column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS child_seat BOOLEAN DEFAULT false;

-- Update existing bookings to have child_seat = false by default
UPDATE public.bookings SET child_seat = false WHERE child_seat IS NULL;

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to include child_seat
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
  b.payment_method,
  b.child_seat,
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
