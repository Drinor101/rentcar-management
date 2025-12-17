-- Add client_email column to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS client_email TEXT;

-- Update existing bookings to have empty email (optional field for backward compatibility)
-- You can update this later if needed

-- Drop the existing reports view first
DROP VIEW IF EXISTS reports;

-- Recreate reports view to include client_email
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
  b.end_date,
  (b.end_date - b.start_date + 1)::INTEGER AS days,
  c.daily_rate,
  b.total_amount,
  b.status,
  b.created_at,
  b.created_by,
  u.username AS created_by_name,
  u.email AS created_by_email
FROM bookings b
JOIN cars c ON b.car_id = c.id
LEFT JOIN public.users u ON b.created_by = u.id;
