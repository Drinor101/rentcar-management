-- Script për të krijuar admin user direkt në public.users
-- Nuk ka nevojë për auth.users - gjithçka ruhet në public.users

-- Krijo admin user direkt
INSERT INTO public.users (email, username, role, password)
VALUES (
  'info@flexrentprishtina.com',
  'admin',
  'admin',
  'Flexrent1234'
)
ON CONFLICT (email) DO UPDATE
SET 
  role = 'admin',
  username = COALESCE(public.users.username, 'admin'),
  password = 'Flexrent1234',
  updated_at = NOW();

-- Verifikimi: Shfaq përdoruesin e krijuar
SELECT 
  id,
  email,
  username,
  role,
  password,
  created_at
FROM public.users
WHERE email = 'info@flexrentprishtina.com';

