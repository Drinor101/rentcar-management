-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (standalone, no dependency on auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, -- Password në plain text për lehtësi menaxhimi
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'puntor')) DEFAULT 'puntor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations on users (since we're not using Supabase Auth)
-- Authorization is handled in the application layer based on role
-- For development, we allow all operations. For production, consider more restrictive policies.
DROP POLICY IF EXISTS "Allow all operations on users" ON public.users;
CREATE POLICY "Allow all operations on users"
ON public.users
FOR ALL
USING (true)
WITH CHECK (true);

-- Note: Since we're not using Supabase Auth, RLS policies are simpler
-- Authorization is handled in the application layer based on role

-- Add created_by to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Add index for created_by
CREATE INDEX IF NOT EXISTS idx_bookings_created_by ON public.bookings(created_by);

-- Update bookings RLS policies
-- Since we're not using Supabase Auth, allow all operations
-- Authorization is handled in application layer
DROP POLICY IF EXISTS "Allow all operations on bookings" ON public.bookings;

CREATE POLICY "Allow all operations on bookings"
ON public.bookings
FOR ALL
USING (true)
WITH CHECK (true);

-- Update reports view to include created_by
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

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

