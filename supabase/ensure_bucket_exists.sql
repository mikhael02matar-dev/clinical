-- Run this too, just to be 100% sure the bucket itself exists
-- (separate from the row-level-security policies).
insert into storage.buckets (id, name, public)
values ('clinical-files', 'clinical-files', false)
on conflict (id) do nothing;
