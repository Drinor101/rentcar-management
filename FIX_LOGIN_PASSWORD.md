# Si të Rregullosh Password për Login

## Problemi:
Password-i në `public.users` është `Flexrent1234`, por login nuk funksionon sepse Supabase Auth përdor password-in nga `auth.users`, jo nga `public.users`.

## Zgjidhja:

### Metoda 1: Update Password në Supabase Dashboard (E Rekomanduar)

1. **Shko në Supabase Dashboard:**
   - Hap: https://supabase.com/dashboard
   - Zgjidh projektin tënd

2. **Shko te Authentication:**
   - Kliko **"Authentication"** në sidebar
   - Kliko **"Users"**

3. **Gjej përdoruesin:**
   - Kërko për `info@flexrentprishtina.com`
   - Ose shiko në listë

4. **Update Password:**
   - Kliko në përdoruesin
   - Në detajet e përdoruesit, gjej **"Password"** section
   - Kliko **"Reset Password"** ose **"Update Password"**
   - Vendos password të ri: `Flexrent1234`
   - Kliko **"Update"** ose **"Save"**

5. **Sigurohu që Email është Konfirmuar:**
   - Nëse shikon "Email not confirmed", kliko **"Send confirmation email"**
   - Ose disable email confirmation (shiko Metoda 2)

### Metoda 2: Disable Email Confirmation (Për Development)

1. **Shko te Authentication Settings:**
   - Supabase Dashboard → **Authentication** → **Settings**

2. **Disable Email Confirmation:**
   - Gjej **"Email Auth"** section
   - Disable **"Enable email confirmations"**
   - Ose vendos **"Auto Confirm"** = true
   - Kliko **"Save"**

3. **Krijo Përdorues të Ri (nëse duhet):**
   - Shko te **Authentication** → **Users**
   - Kliko **"Add user"** → **"Create new user"**
   - Email: `info@flexrentprishtina.com`
   - Password: `Flexrent1234`
   - **Auto Confirm User: ✅ (CHECK THIS!)**
   - Kliko **"Create user"**

4. **Update në public.users:**
   - Ekzekuto `004_create_admin_user.sql` përsëri për të update-uar password në `public.users`

### Metoda 3: Përmes SQL (Nëse ke Service Role Key)

Nëse ke service role key, mund të përdorësh Supabase Admin API, por kjo kërkon konfigurim shtesë.

## Verifikimi:

Pas update, provo të hysh me:
- Email: `info@flexrentprishtina.com`
- Password: `Flexrent1234`

## Shënim i Rëndësishëm:

- Password në `public.users` është vetëm për **shfaqje/menaxhim** në UI
- Password për **login** duhet të jetë i saktë në `auth.users`
- Supabase Auth **hash-on** password-in në `auth.users`, kështu që nuk mund ta shohësh në plain text atje

