-- Sabri's Dental Clinic - database schema
-- Run this in Supabase SQL editor (Project -> SQL Editor -> New query -> paste -> Run)

create extension if not exists "uuid-ossp";

-- Staff accounts. One row per login, linked to a Supabase Auth user.
create table if not exists staff (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('dentist', 'receptionist')),
  created_at timestamptz default now()
);

-- Patients
create table if not exists patients (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  age int,
  gender text,
  address text,
  created_at timestamptz default now()
);

-- Visit history (one row per visit, numbered per patient)
create table if not exists visits (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  visit_number int not null,
  visit_date date not null default current_date,
  procedure text not null,
  medicine text,
  dentist_name text,
  created_at timestamptz default now()
);

-- Appointments
create table if not exists appointments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  appointment_date date not null,
  appointment_time time not null,
  procedure text,
  status text not null default 'scheduled' check (status in ('scheduled', 'checked_in', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

-- Payments / billing
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  patient_id uuid not null references patients(id) on delete cascade,
  visit_id uuid references visits(id) on delete set null,
  amount numeric(10, 2) not null,
  paid boolean not null default false,
  payment_date date default current_date,
  created_at timestamptz default now()
);

-- Helpful indexes
create index if not exists idx_visits_patient on visits(patient_id);
create index if not exists idx_appointments_date on appointments(appointment_date);
create index if not exists idx_payments_date on payments(payment_date);

-- Row Level Security: only logged-in staff can read/write.
-- (Role-specific restrictions, e.g. receptionist can't see reports, are enforced in the app/backend.)
alter table staff enable row level security;
alter table patients enable row level security;
alter table visits enable row level security;
alter table appointments enable row level security;
alter table payments enable row level security;

create policy "staff can read own row" on staff for select using (auth.uid() = auth_user_id);

create policy "authenticated read patients" on patients for select using (auth.role() = 'authenticated');
create policy "authenticated write patients" on patients for insert with check (auth.role() = 'authenticated');
create policy "authenticated update patients" on patients for update using (auth.role() = 'authenticated');

create policy "authenticated read visits" on visits for select using (auth.role() = 'authenticated');
create policy "authenticated write visits" on visits for insert with check (auth.role() = 'authenticated');

create policy "authenticated read appointments" on appointments for select using (auth.role() = 'authenticated');
create policy "authenticated write appointments" on appointments for insert with check (auth.role() = 'authenticated');
create policy "authenticated update appointments" on appointments for update using (auth.role() = 'authenticated');

create policy "authenticated read payments" on payments for select using (auth.role() = 'authenticated');
create policy "authenticated write payments" on payments for insert with check (auth.role() = 'authenticated');
create policy "authenticated update payments" on payments for update using (auth.role() = 'authenticated');

-- After running this, create staff logins:
-- 1. Supabase Dashboard -> Authentication -> Users -> Add user (email + password) for the dentist and the receptionist.
-- 2. Copy each user's UUID, then run for each:
--    insert into staff (auth_user_id, name, role) values ('<uuid-from-auth-users>', 'Dr. Sabri', 'dentist');
--    insert into staff (auth_user_id, name, role) values ('<uuid-from-auth-users>', 'Reception', 'receptionist');
