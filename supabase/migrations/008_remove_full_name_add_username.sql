-- Remove full_name column and make username required
-- First, update existing users to have username from full_name if username is null
UPDATE public.users
SET username = LOWER(REPLACE(full_name, ' ', '_'))
WHERE username IS NULL AND full_name IS NOT NULL;

-- If still null, use email prefix
UPDATE public.users
SET username = SPLIT_PART(email, '@', 1)
WHERE username IS NULL;

-- If still null, set a default username
UPDATE public.users
SET username = 'user_' || SUBSTRING(id::text, 1, 8)
WHERE username IS NULL;

-- Update reports view to use username instead of full_name
CREATE OR REPLACE VIEW reports AS
SELECT 
  b.id,
  b.car_id,
  c.make AS car_make,
  c.model AS car_model,
  b.client_name,
  b.client_phone,
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

-- Now make username NOT NULL
ALTER TABLE public.users
ALTER COLUMN username SET NOT NULL;

-- Remove full_name column
ALTER TABLE public.users
DROP COLUMN IF EXISTS full_name;

