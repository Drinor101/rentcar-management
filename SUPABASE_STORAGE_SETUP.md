# Konfigurimi i Supabase Storage për Upload të Fotove

## Hapat për të Konfiguruar Storage Bucket

### 1. Krijo Storage Bucket në Supabase

1. Shko në Supabase Dashboard → **Storage**
2. Kliko **"New bucket"**
3. Emër bucket: `car-images`
4. Zgjidh **Public bucket** (që fotot të jenë publike)
5. Kliko **"Create bucket"**

### 2. Konfiguro Bucket Policies

**Metoda 1: Përmes SQL Editor (E Rekomanduar)**

1. Shko në Supabase Dashboard → **SQL Editor**
2. Kliko **"New Query"**
3. Kopjo dhe ekzekuto SQL nga `supabase/migrations/002_storage_policies.sql`
4. Kjo do të krijojë bucket-in dhe të gjitha policies e nevojshme

**Metoda 2: Manual përmes Dashboard**

1. Shko te **Storage** → **Policies** → `car-images`
2. Kliko **"New Policy"**
3. Zgjidh **"For full customization"**
4. Emër policy: `Allow public uploads`
5. SQL Policy:

```sql
-- Allow anyone to upload files
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'car-images');
```

6. Krijo edhe policies të tjera:
   - **Allow public reads** (SELECT)
   - **Allow public updates** (UPDATE)
   - **Allow public deletes** (DELETE)

**SQL i plotë për të gjitha policies:**

```sql
-- Policy: Allow public to upload files
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'car-images');

-- Policy: Allow public to read files
CREATE POLICY "Allow public reads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'car-images');

-- Policy: Allow public to update files
CREATE POLICY "Allow public updates"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'car-images')
WITH CHECK (bucket_id = 'car-images');

-- Policy: Allow public to delete files
CREATE POLICY "Allow public deletes"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'car-images');
```

### 3. Verifikimi

Pas konfigurimit, aplikacioni do të jetë në gjendje të:
- ✅ Ngarkojë fotot në Supabase Storage
- ✅ Shfaqë fotot publike
- ✅ Fshijë fotot kur fshihet makina

## Struktura e File-ave

Fotot do të ruhen në bucket `car-images` me emra unikë:
- Format: `{carId}-{timestamp}.{extension}` (për makinat ekzistuese)
- Format: `car-{timestamp}.{extension}` (për makinat e reja)

## Troubleshooting

### Error: "Bucket not found"
- Verifiko që bucket `car-images` ekziston në Supabase Dashboard
- Verifiko që emri i bucket-it është saktësisht `car-images`

### Error: "new row violates row-level security policy"
- Verifiko që policies janë konfiguruar siç tregohet më sipër
- Sigurohu që bucket-i është **Public**

### Fotot nuk shfaqen
- Verifiko që bucket-i është **Public**
- Kontrollo që URL-ja e fotos është e saktë në database

## Alternativë: RLS Policies më të Sigurta

Nëse dëshiron më shumë siguri, mund të përdorësh RLS policies që kërkojnë autentifikim:

```sql
-- Kërkon autentifikim për upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'car-images');
```

Por për këtë aplikacion, public policies janë të mjaftueshme.

