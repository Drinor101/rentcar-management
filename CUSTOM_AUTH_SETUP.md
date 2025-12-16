# Custom Authentication Setup (pa Supabase Auth)

## Ndryshimet e Bëra:

### 1. Tabela `public.users` (Standalone)
- **Nuk ka më varësi nga `auth.users`**
- Password ruhet në **plain text** për lehtësi menaxhimi
- `id` është UUID i krijuar automatikisht (jo nga `auth.users`)
- Email është UNIQUE

### 2. Authentication Service
- Login kontrollon password **direkt nga `public.users`**
- Session ruhet në **sessionStorage** (jo në Supabase Auth)
- Nuk përdor më `supabase.auth.signInWithPassword()`

### 3. RLS Policies
- RLS policies janë të thjeshtuara (lejojnë të gjitha operacionet)
- Autorizimi bëhet në **nivel aplikacioni** (në bazë të `role`)

## Hapat për të Ekzekutuar Migracionet:

### 1. Ekzekuto Migracionet në Supabase Dashboard:

#### a) `003_users_schema.sql` - Krijo tabelën `users` (standalone)
```sql
-- Ky script krijon tabelën public.users pa varësi nga auth.users
-- Ekzekuto në Supabase Dashboard → SQL Editor
```

#### b) `004_create_admin_user.sql` - Krijo admin user
```sql
-- Ky script krijon admin user direkt në public.users
-- Email: info@flexrentprishtina.com
-- Password: Flexrent1234
-- Ekzekuto në Supabase Dashboard → SQL Editor
```

#### c) `005_add_password_to_users.sql` - Shto kolonën password (nëse nuk ekziston)
```sql
-- Ky script shton kolonën password nëse nuk ekziston
-- Ekzekuto në Supabase Dashboard → SQL Editor
```

### 2. Verifikimi:

Pas ekzekutimit të migracioneve, verifiko:

```sql
-- Shfaq të gjithë përdoruesit
SELECT 
  id,
  email,
  full_name,
  role,
  password,
  created_at
FROM public.users;
```

Duhet të shohësh:
- Email: `info@flexrentprishtina.com`
- Role: `admin`
- Password: `Flexrent1234`

### 3. Test Login:

1. Hap aplikacionin
2. Shkruaj email: `info@flexrentprishtina.com`
3. Shkruaj password: `Flexrent1234`
4. Kliko "Hyr"

## Ndryshimet në Kod:

### `authService.ts`
- `signIn()` - Kontrollon password direkt nga `public.users`
- `getCurrentUser()` - Lexon nga `sessionStorage`
- `signOut()` - Fshin nga `sessionStorage`
- Nuk përdor më `supabase.auth`

### `AuthContext.tsx`
- Nuk përdor më `SupabaseUser` nga `@supabase/supabase-js`
- Përdor `User` nga `authService`
- Nuk përdor më `onAuthStateChange` nga Supabase Auth

### `003_users_schema.sql`
- Tabela `users` nuk ka më `REFERENCES auth.users(id)`
- `id` është `UUID PRIMARY KEY DEFAULT uuid_generate_v4()`
- RLS policies lejojnë të gjitha operacionet (autorizimi në aplikacion)

### `004_create_admin_user.sql`
- Krijo përdorues direkt në `public.users` (jo nga `auth.users`)

## Shënime të Rëndësishme:

1. **Password Security**: Password ruhet në plain text për lehtësi menaxhimi. Për production, konsidero hashing (bcrypt, argon2, etj.)

2. **Session Management**: Session ruhet në `sessionStorage`, që do të fshihet kur përdoruesi mbyll browser-in.

3. **RLS Policies**: Meqenëse nuk përdorim Supabase Auth, RLS policies janë të thjeshtuara. Autorizimi bëhet në aplikacion bazuar në `role`.

4. **User Management**: Admin mund të shtojë, modifikojë dhe fshijë përdoruesit direkt nga UI.

## Troubleshooting:

### Problem: Login nuk funksionon
- Verifiko që përdoruesi ekziston në `public.users`
- Verifiko që password është i saktë (case-sensitive)
- Kontrollo console për errors

### Problem: Session nuk ruhet
- Verifiko që `sessionStorage` është i aktivizuar në browser
- Kontrollo që nuk ke extensions që bllokojnë storage

### Problem: RLS policies bllokojnë operacionet
- Verifiko që RLS policies lejojnë të gjitha operacionet
- Ose disable RLS për development (jo rekomanduar për production)

