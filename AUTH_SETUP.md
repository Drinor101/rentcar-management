# Konfigurimi i Autentifikimit dhe Role-Based Access Control

## Hapat për Konfigurim

### 1. Ekzekuto SQL Migration

1. Shko në Supabase Dashboard → **SQL Editor**
2. Kliko **"New Query"**
3. Kopjo dhe ekzekuto SQL nga `supabase/migrations/003_users_schema.sql`
4. Kjo do të krijojë:
   - Tabelën `users` që shtrihet `auth.users`
   - RLS policies për role-based access
   - Kolonën `created_by` në tabelën `bookings`

### 2. Krijo Përdoruesin e Parë (Admin)

**Metoda 1: Përmes SQL Script (E Rekomanduar)**

Nëse ke krijuar tashmë përdoruesin në Authentication:

1. Shko në Supabase Dashboard → **SQL Editor**
2. Ekzekuto script-in nga `supabase/migrations/004_create_admin_user.sql`
3. Ky script do të gjejë automatikisht përdoruesin nga email dhe do t'i shtojë role 'admin'

**Metoda 2: Manual**

1. Shko në Supabase Dashboard → **Authentication** → **Users**
2. Kliko **"Add user"** → **"Create new user"**
3. Vendos:
   - Email: `info@flexrentprishtina.com` (ose email i preferuar)
   - Password: (vendos një fjalëkalim të fortë)
   - Auto Confirm User: ✅ (check)
4. Kliko **"Create user"**
5. Kopjo **User UID** që u krijua

6. Shko në **SQL Editor** dhe ekzekuto:

```sql
-- Insert admin user profile
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'USER_UID_FROM_STEP_5',  -- Zëvendëso me UID-në e përdoruesit
  'info@flexrentprishtina.com',
  'Administrator',
  'admin'
);
```

### 3. Krijo Përdorues Puntor (Opsionale)

Për të krijuar puntorë, mund të:
- Përdorësh faqen "Përdoruesit" në aplikacion (vetëm admin)
- Ose të ekzekutosh SQL manual:

```sql
-- Krijoni përdorues në Auth
-- Pastaj insert në public.users:
INSERT INTO public.users (id, email, full_name, role)
VALUES (
  'USER_UID',
  'puntor@rentcar.com',
  'Emri i Puntorit',
  'puntor'
);
```

## Funksionaliteti

### Admin
- ✅ Sheh të gjitha rezervimet (të gjithë puntorëve)
- ✅ Sheh të gjitha raportet (të gjithë puntorëve)
- ✅ Sheh të gjitha makinat
- ✅ Mund të menaxhojë përdoruesit (shto, ndrysho, fshi)
- ✅ Mund të ndryshojë rolet e përdoruesve

### Puntor
- ✅ Sheh vetëm rezervimet e veta
- ✅ Sheh vetëm raportet e veta
- ✅ Sheh të gjitha makinat (mund të shtojnë makina)
- ❌ Nuk sheh përdoruesit
- ❌ Nuk sheh rezervimet e puntorëve të tjerë

## RLS Policies

Policies janë konfiguruar automatikisht në migration:
- Përdoruesit mund të lexojnë vetëm rezervimet e tyre
- Admin mund të lexojë të gjitha rezervimet
- Përdoruesit mund të krijojnë rezervime (me `created_by` automatik)
- Admin mund të përditësojë/fshijë të gjitha rezervimet

## Troubleshooting

### Error: "new row violates row-level security policy"
- Verifiko që migration është ekzekutuar
- Verifiko që RLS policies janë krijuar
- Verifiko që përdoruesi ka role në tabelën `users`

### Përdoruesi nuk mund të hyjë
- Verifiko që email dhe password janë të sakta
- Verifiko që përdoruesi ekziston në `auth.users`
- Verifiko që profile ekziston në `public.users`

### Admin nuk sheh të gjitha rezervimet
- Verifiko që role është 'admin' në `public.users`
- Verifiko që RLS policies janë konfiguruar siç duhet

