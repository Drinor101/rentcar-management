# Troubleshooting Login Issues

## Problem: Error 400 Bad Request gjatë login

### Kontrollo këto:

1. **Verifiko që përdoruesi ekziston në `auth.users`:**
   ```sql
   SELECT id, email, email_confirmed_at, created_at
   FROM auth.users
   WHERE email = 'info@flexrentprishtina.com';
   ```

2. **Kontrollo që email është konfirmuar:**
   - Nëse `email_confirmed_at` është NULL, përdoruesi nuk mund të hyjë
   - Duhet të konfirmosh email-in ose ta disable-osh email confirmation në Supabase

3. **Disable Email Confirmation (për development):**
   - Shko në Supabase Dashboard → **Authentication** → **Settings**
   - Nën **"Email Auth"**, disable **"Enable email confirmations"**
   - Ose vendos **"Auto Confirm"** në true

4. **Verifiko password:**
   - Password duhet të jetë saktësisht `Flexrent1234` (case-sensitive)
   - Kontrollo që nuk ka hapësira ekstra

5. **Kontrollo që përdoruesi ekziston në `public.users`:**
   ```sql
   SELECT * FROM public.users
   WHERE email = 'info@flexrentprishtina.com';
   ```

## Zgjidhja e Shpejtë:

### Hapi 1: Disable Email Confirmation
1. Supabase Dashboard → **Authentication** → **Settings**
2. Gjej **"Email Auth"**
3. Disable **"Enable email confirmations"**
4. Ose vendos **"Auto Confirm"** = true

### Hapi 2: Verifiko dhe Update Password në auth.users
**Kjo është hapi më i rëndësishëm!** Password për login duhet të jetë i saktë në `auth.users`:

1. Supabase Dashboard → **Authentication** → **Users**
2. Gjej përdoruesin `info@flexrentprishtina.com`
3. Kliko në përdoruesin
4. Kliko **"Reset Password"** ose **"Update Password"**
5. Vendos password: `Flexrent1234`
6. **Sigurohu që "Auto Confirm" është aktiv** ose konfirmo email-in

**Ose krijo përdorues të ri:**
1. Fshi përdoruesin e vjetër nga Authentication → Users
2. Kliko **"Add user"** → **"Create new user"**
3. Email: `info@flexrentprishtina.com`
4. Password: `Flexrent1234`
5. **Auto Confirm User: ✅ (CHECK THIS!)**
6. Kliko **"Create user"**
7. Pastaj ekzekuto `004_create_admin_user.sql` për të shtuar në `public.users`

### Hapi 3: Krijo Përdorues të Ri (nëse problemi vazhdon)
```sql
-- Fshi përdoruesin e vjetër (nëse ka)
DELETE FROM public.users WHERE email = 'info@flexrentprishtina.com';
-- Pastaj fshi nga auth.users përmes Dashboard

-- Krijo përdorues të ri në Dashboard me:
-- Email: info@flexrentprishtina.com
-- Password: Flexrent1234
-- Auto Confirm: ✅

-- Pastaj ekzekuto:
INSERT INTO public.users (id, email, full_name, role, password)
SELECT 
  id,
  email,
  'Administrator',
  'admin',
  'Flexrent1234'
FROM auth.users
WHERE email = 'info@flexrentprishtina.com';
```

## Kontrollo Error në Console:

Nëse error-i thotë:
- **"Invalid login credentials"** → Email ose password i gabuar
- **"Email not confirmed"** → Duhet të konfirmosh email-in ose ta disable-osh confirmation
- **"User not found"** → Përdoruesi nuk ekziston në auth.users

## Test Login:

Pas konfigurimit, provo të hysh me:
- Email: `info@flexrentprishtina.com`
- Password: `Flexrent1234`

