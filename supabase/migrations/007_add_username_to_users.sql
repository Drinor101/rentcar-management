-- Add username column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);

-- Update existing admin user to have username (optional)
-- UPDATE public.users
-- SET username = 'admin'
-- WHERE email = 'info@flexrentprishtina.com' AND username IS NULL;

