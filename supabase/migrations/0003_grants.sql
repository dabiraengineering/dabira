-- Tables created via the Management API's raw SQL endpoint didn't pick up
-- Supabase's usual default-privilege grants. service_role must be able to
-- read/write every table (it bypasses RLS, but still needs base GRANTs);
-- anon/authenticated get USAGE only since there are no policies for them.

grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;

alter default privileges in schema public
  grant all on tables to service_role;
alter default privileges in schema public
  grant all on sequences to service_role;
