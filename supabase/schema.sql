-- Axis Motion schema — full version (includes the clinical profile fields).
-- Run this once in a BRAND NEW Supabase project's SQL Editor.
-- If your project already ran the original schema.sql, run
-- migration_v2_clinical_profile.sql instead — don't run this file again.

-- ============================================================
-- 1. Tables
-- ============================================================

create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('physio', 'patient')),
  name text,
  created_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key references auth.users (id) on delete cascade,
  physio_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  date_of_birth date,
  gender text,
  emergency_contact text,
  pathologies text,
  patient_history text,
  current_phase text not null default 'Phase 1: Analgesic & Pain Management',
  status text not null default 'active' check (status in ('active', 'discharged')),
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients (id) on delete cascade,
  physio_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null,
  session_time time not null,
  phase text,
  pain_before smallint check (pain_before between 0 and 10),
  pain_after smallint check (pain_after between 0 and 10),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists exercises (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients (id) on delete cascade,
  physio_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text not null,
  video_url text,
  created_at timestamptz not null default now()
);

create table if not exists clinical_files (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients (id) on delete cascade,
  physio_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  file_type text not null default 'Other',
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists patients_physio_id_idx on patients (physio_id);
create index if not exists sessions_physio_id_idx on sessions (physio_id);
create index if not exists sessions_patient_id_idx on sessions (patient_id);
create index if not exists exercises_patient_id_idx on exercises (patient_id);
create index if not exists clinical_files_patient_id_idx on clinical_files (patient_id);

-- ============================================================
-- 2. Auto-create a profiles row whenever a new auth user signs up
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'role', 'patient'),
    new.raw_user_meta_data ->> 'name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- 3. Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table patients enable row level security;
alter table sessions enable row level security;
alter table exercises enable row level security;
alter table clinical_files enable row level security;

drop policy if exists "profiles: read own" on profiles;
create policy "profiles: read own"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "patients: physio reads own" on patients;
create policy "patients: physio reads own"
  on patients for select
  using (auth.uid() = physio_id);

drop policy if exists "patients: physio reads own record" on patients;
create policy "patients: physio reads own record"
  on patients for select
  using (auth.uid() = id);

drop policy if exists "patients: physio inserts own" on patients;
create policy "patients: physio inserts own"
  on patients for insert
  with check (auth.uid() = physio_id);

drop policy if exists "patients: physio updates own" on patients;
create policy "patients: physio updates own"
  on patients for update
  using (auth.uid() = physio_id);

drop policy if exists "sessions: physio manages own" on sessions;
create policy "sessions: physio manages own"
  on sessions for all
  using (auth.uid() = physio_id)
  with check (auth.uid() = physio_id);

drop policy if exists "sessions: patient reads own" on sessions;
create policy "sessions: patient reads own"
  on sessions for select
  using (auth.uid() = patient_id);

drop policy if exists "exercises: physio manages own" on exercises;
create policy "exercises: physio manages own"
  on exercises for all
  using (auth.uid() = physio_id)
  with check (auth.uid() = physio_id);

drop policy if exists "exercises: patient reads own" on exercises;
create policy "exercises: patient reads own"
  on exercises for select
  using (auth.uid() = patient_id);

drop policy if exists "clinical_files: physio manages own" on clinical_files;
create policy "clinical_files: physio manages own"
  on clinical_files for all
  using (auth.uid() = physio_id)
  with check (auth.uid() = physio_id);

drop policy if exists "clinical_files: patient reads own" on clinical_files;
create policy "clinical_files: patient reads own"
  on clinical_files for select
  using (auth.uid() = patient_id);

-- ============================================================
-- 4. Storage bucket for clinical files
-- ============================================================

insert into storage.buckets (id, name, public)
values ('clinical-files', 'clinical-files', false)
on conflict (id) do nothing;

drop policy if exists "clinical-files storage: physio manages own patient folder" on storage.objects;
create policy "clinical-files storage: physio manages own patient folder"
  on storage.objects for all
  using (
    bucket_id = 'clinical-files'
    and exists (
      select 1 from patients
      where patients.id::text = (storage.foldername(name))[1]
      and patients.physio_id = auth.uid()
    )
  )
  with check (
    bucket_id = 'clinical-files'
    and exists (
      select 1 from patients
      where patients.id::text = (storage.foldername(name))[1]
      and patients.physio_id = auth.uid()
    )
  );

drop policy if exists "clinical-files storage: patient reads own folder" on storage.objects;
create policy "clinical-files storage: patient reads own folder"
  on storage.objects for select
  using (
    bucket_id = 'clinical-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
