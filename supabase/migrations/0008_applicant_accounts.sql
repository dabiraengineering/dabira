-- Optional applicant accounts: a lead can exist with no account (today's
-- anonymous flow, unchanged) or be linked to a Supabase Auth user so the
-- applicant can sign in later and see their own application status/history.

alter table leads add column user_id uuid references auth.users(id);
create index leads_user_id_idx on leads (user_id);
