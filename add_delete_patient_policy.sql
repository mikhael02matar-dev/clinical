-- Run this once in your Supabase project's SQL Editor.
-- Adds the missing DELETE permissions so a physio can delete one of
-- their own patients (and, via cascade, that patient's sessions,
-- exercises, and clinical_files rows).

drop policy if exists "patients: physio deletes own" on patients;
create policy "patients: physio deletes own"
  on patients for delete
  using (physio_id = auth.uid());

drop policy if exists "profiles: physio deletes own patients" on profiles;
create policy "profiles: physio deletes own patients"
  on profiles for delete
  using (
    exists (
      select 1 from patients
      where patients.id = profiles.id
      and patients.physio_id = auth.uid()
    )
  );
