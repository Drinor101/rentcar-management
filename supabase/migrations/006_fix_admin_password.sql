-- Script për të verifikuar dhe rregulluar password-in e admin user
-- Kujdes: Ky script nuk mund të ndryshojë password në auth.users direkt
-- Duhet ta bësh manualisht përmes Supabase Dashboard

-- 1. Verifiko që përdoruesi ekziston në auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email = 'info@flexrentprishtina.com';

-- 2. Verifiko që përdoruesi ekziston në public.users
SELECT 
  id,
  email,
  full_name,
  role,
  password,
  created_at
FROM public.users
WHERE email = 'info@flexrentprishtina.com';

-- 3. Update password në public.users (vetëm për shfaqje)
UPDATE public.users
SET password = 'Flexrent1234'
WHERE email = 'info@flexrentprishtina.com';

-- ⚠️ IMPORTANTE: Për të rregulluar password në auth.users:
-- 
-- Supabase Auth përdor password-in nga auth.users, JO nga public.users!
-- Password në public.users është vetëm për shfaqje/menaxhim.
--
-- HAPAT PËR TË RREGULLUAR:
--
-- 1. Shko në Supabase Dashboard → Authentication → Users
-- 2. Gjej përdoruesin: info@flexrentprishtina.com
-- 3. Kliko në përdoruesin për të hapur detajet
-- 4. Në seksionin "Password", kliko "Reset Password" ose "Update Password"
-- 5. Vendos password: Flexrent1234
-- 6. Kliko "Update" ose "Save"
--
-- OSE:
--
-- 1. Disable Email Confirmation:
--    - Authentication → Settings → Email Auth
--    - Disable "Enable email confirmations"
--    - Ose vendos "Auto Confirm" = true
--
-- 2. Krijo përdorues të ri:
--    - Authentication → Users → "Add user" → "Create new user"
--    - Email: info@flexrentprishtina.com
--    - Password: Flexrent1234
--    - Auto Confirm User: ✅ (CHECK THIS!)
--    - Kliko "Create user"
--
-- 3. Pastaj ekzekuto 004_create_admin_user.sql përsëri

