-- Supabase pg_cron (free, built into Postgres) is the scheduler in place
-- of Vercel Cron, which has frequency/job-count limits on lower tiers.
-- Every job below just fires an authenticated HTTP GET at a Next.js
-- Route Handler — all business logic lives in the app, Supabase is
-- purely the trigger source.
--
-- Note: REPLACE_WITH_SITE_URL is inlined per-job (not a database-level
-- setting) because `alter database ... set` requires superuser, which
-- Supabase doesn't grant even via the Management API's SQL endpoint.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Secret stored in Vault rather than inlined in cron.job.command, which
-- anyone able to read the cron schema could otherwise see.
select vault.create_secret(
  'REPLACE_WITH_CRON_SHARED_SECRET',
  'cron_shared_secret'
);

-- Reminders (SMS 2): scheduled HOURLY, not at a fixed UTC hour — the
-- route handler itself checks for 9am America/New_York, avoiding DST
-- drift that a hardcoded UTC cron time would silently accumulate.
select cron.schedule(
  'reminders',
  '0 * * * *',
  $$
  select net.http_get(
    url := 'REPLACE_WITH_SITE_URL/api/cron/reminders',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
    )
  );
  $$
);

-- Release application links (SMS 3 / waitlist-promotion path): hourly.
select cron.schedule(
  'release-application-links',
  '5 * * * *',
  $$
  select net.http_get(
    url := 'REPLACE_WITH_SITE_URL/api/cron/release-application-links',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
    )
  );
  $$
);

-- No-month nudge (SMS 4): daily.
select cron.schedule(
  'no-month-nudge',
  '0 14 * * *',
  $$
  select net.http_get(
    url := 'REPLACE_WITH_SITE_URL/api/cron/no-month-nudge',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
    )
  );
  $$
);

-- Monthly cohort reset: daily (route itself no-ops except on the 1st).
select cron.schedule(
  'monthly-reset',
  '0 5 * * *',
  $$
  select net.http_get(
    url := 'REPLACE_WITH_SITE_URL/api/cron/monthly-reset',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
    )
  );
  $$
);

-- FX rate refresh: daily.
select cron.schedule(
  'refresh-fx-rates',
  '30 6 * * *',
  $$
  select net.http_get(
    url := 'REPLACE_WITH_SITE_URL/api/cron/refresh-fx-rates',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_shared_secret')
    )
  );
  $$
);
