-- Axis Motion — fix: clinical-files upload blocked by row-level security
-- Safe to run any number of times.

-- Make sure the bucket exists.
insert into storage.buckets (id, name, public)
values ('clinical-files', 'clinical-files', false)
on conflict (id) do nothing;

-- Drop old copies first (harmless if they don't exist) then recreate.
drop policy if exists "clinical-files storage: physio manages own patient folder" on storage.objects;
drop policy if exists "clinical-files storage: patient reads own folder" on storage.objects;

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

create policy "clinical-files storage: patient reads own folder"
  on storage.objects for select
  using (
    bucket_id = 'clinical-files'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Also make sure the table-level policies exist (belt and suspenders).
drop policy if exists "clinical_files: physio manages own" on clinical_files;
drop policy if exists "clinical_files: patient reads own" on clinical_files;

create policy "clinical_files: physio manages own"
  on clinical_files for all
  using (auth.uid() = physio_id)
  with check (auth.uid() = physio_id);

create policy "clinical_files: patient reads own"
  on clinical_files for select
  using (auth.uid() = patient_id);
