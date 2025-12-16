# Udhëzues për Integrimin me Supabase

## Hapat për të Konfiguruar Supabase

### 1. Krijo Supabase Project
1. Shko në [supabase.com](https://supabase.com)
2. Krijo një projekt të ri
3. Ruaj **Project URL** dhe **anon/public key**

### 2. Konfiguro Environment Variables

Krijo një file `.env` në root të projektit:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**⚠️ IMPORTANTE:** Mos e commit `.env` file në Git! Është tashmë në `.gitignore`.

### 3. Ekzekuto SQL Migration në Supabase

1. Shko në Supabase Dashboard → SQL Editor
2. Kopjo përmbajtjen e `supabase/migrations/001_initial_schema.sql`
3. Ekzekuto SQL query
4. Verifiko që tables janë krijuar: `cars`, `bookings`, dhe view `reports`

### 4. Testo Connection

Pas konfigurimit, aplikacioni do të lidhet automatikisht me Supabase.

## Struktura e Database

### Tabela: `cars`
- Të gjitha makinat e sistemit
- Status: `available`, `rented`, `maintenance`

### Tabela: `bookings`
- Të gjitha rezervimet
- Linked me `cars` përmes `car_id`
- Status: `active`, `completed`, `cancelled`

### View: `reports`
- Kombinon `bookings` me `cars` për raporte
- Llogarit automatikisht ditët

## Service Layer

Të gjitha operacionet me database janë në:
- `src/services/carsService.ts` - Operacionet për makinat
- `src/services/bookingsService.ts` - Operacionet për rezervimet
- `src/services/reportsService.ts` - Query për raportet

## Hapat e Ardhshëm

1. ✅ Instalo Supabase client
2. ✅ Krijo database schema
3. ✅ Krijo service layer
4. ⏳ Update App.tsx për të përdorur Supabase (në vazhdim)
5. ⏳ Shto error handling dhe loading states
6. ⏳ Implemento real-time updates

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifiko që `.env` file ekziston
- Verifiko që variablat fillojnë me `VITE_`
- Restart dev server pas ndryshimeve në `.env`

### Error: "relation does not exist"
- Ekzekuto SQL migration në Supabase Dashboard
- Verifiko që tables janë krijuar

### Error: "permission denied"
- Verifiko RLS policies në Supabase
- Për development, policies lejojnë të gjitha operacionet

