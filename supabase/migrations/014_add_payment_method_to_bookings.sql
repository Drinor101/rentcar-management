-- Add payment_method column to bookings table
-- This stores the payment method used for the booking
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20);

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to include payment_method
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
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
