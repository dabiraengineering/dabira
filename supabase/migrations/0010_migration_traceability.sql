-- Temporary columns for the Airtable -> Supabase migration, dropped
-- once the cutover is verified stable (see plan's Phase 6/7).
alter table leads add column airtable_record_id text unique;
alter table scans add column airtable_record_id text unique;
