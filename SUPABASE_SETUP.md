# Supabase Integration Plan - RentCar Management

## Hapat e Integrimit

### 1. Instalimi dhe Konfigurimi
- [x] Instalo `@supabase/supabase-js`
- [ ] Krijo `.env` file për environment variables
- [ ] Krijo Supabase client configuration

### 2. Database Schema Design

#### Tabela: `cars`
```sql
- id (uuid, primary key)
- make (text)
- model (text)
- year (integer)
- color (text)
- license_plate (text, unique)
- daily_rate (numeric)
- image (text)
- status (text: 'available', 'rented', 'maintenance')
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabela: `bookings`
```sql
- id (uuid, primary key)
- car_id (uuid, foreign key -> cars.id)
- client_name (text)
- client_phone (text)
- start_date (date)
- end_date (date)
- total_amount (numeric)
- status (text: 'active', 'completed', 'cancelled')
- created_at (timestamp)
- updated_at (timestamp)
```

#### Tabela: `reports` (view ose materialized view)
```sql
- id (uuid, primary key)
- car_id (uuid)
- car_make (text)
- car_model (text)
- client_name (text)
- client_phone (text)
- start_date (date)
- end_date (date)
- days (integer)
- daily_rate (numeric)
- total_amount (numeric)
- status (text)
- created_at (timestamp)
```

### 3. Row Level Security (RLS) Policies
- Enable RLS në të gjitha tables
- Krijo policies për read/write operations

### 4. Service Layer
- `services/carsService.ts` - CRUD operations për cars
- `services/bookingsService.ts` - CRUD operations për bookings
- `services/reportsService.ts` - Query operations për reports

### 5. TypeScript Types
- Generate types nga Supabase schema
- Update existing types në `src/types/index.ts`

### 6. Integration në Components
- Replace mock data me Supabase queries
- Add loading states
- Add error handling
- Implement real-time subscriptions

## SQL Migrations

Të gjitha SQL queries do të jenë në `supabase/migrations/` folder.

