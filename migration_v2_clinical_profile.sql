-- Axis Motion — migration v2: clinical profile fields
-- Run this in your Supabase SQL Editor. Safe to run even with existing
-- patients/sessions rows — it only adds new columns/tables.

-- ============================================================
-- 1. Richer patient profile
-- ============================================================

alter table patients add column if not exists phone text;
alter table patients add column if not exists date_of_birth date;
alter table patients add column if not exists gender text;
alter table patients add column if not exists emergency_contact text;
alter table patients add column if not exists pathologies text;
alter table patients add column if not exists patient_history text;
alter table patients add column if not exists current_phase text
  not null default 'Phase 1: Analgesic & Pain Management';
alter table patients add column if not exists status text
  not null default 'active' check (status in ('active', 'discharged'));

-- ============================================================
-- 2. Pain tracking + phase on each session
-- ============================================================

alter table sessions add column if not exists phase text;
alter table sessions add column if not exists pain_before smallint
  check (pain_before between 0 and 10);
alter table sessions add column if not exists pain_after smallint
  check (pain_after between 0 and 10);

-- ============================================================
-- 3. Clinical files (MRIs, X-rays, reports, etc.)
-- ============================================================

create table if not exists clinical_files (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients (id) on delete cascade,
  physio_id uuid not null references auth.users (id) on delete cascade,
  file_name text not null,
  file_type text not null default 'Other',
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists clinical_files_patient_id_idx on clinical_files (patient_id);

alter table clinical_files enable row level security;

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
-- 4. Storage bucket for the actual files
--    (Also do this once by hand: Storage -> New bucket -> name it
--    "clinical-files", keep it PRIVATE, i.e. do not toggle "Public bucket".)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('clinical-files', 'clinical-files', false)
on conflict (id) do nothing;

-- Files are stored at a path like "<patient_id>/<filename>". These
-- policies check that the folder name matches either the patient
-- themselves, or the physio who owns that patient.

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
