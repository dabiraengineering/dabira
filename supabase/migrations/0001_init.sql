-- Dabira Projects rebuild: initial schema.
-- RLS is enabled deny-by-default everywhere; the app talks to Supabase
-- server-side with the service-role key, which bypasses RLS. The only
-- client-side Supabase usage is the Auth handshake on /admin/login.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- enums
-- ---------------------------------------------------------------------------

create type lead_source as enum ('study_application', 'waitlist');
create type lead_availability as enum ('first_half', 'second_half');
create type english_comfort as enum ('yes', 'no', 'somewhat');
create type referral_source as enum ('friend', 'instagram', 'tiktok', 'linkedin', 'flyer', 'other');
create type lead_status as enum ('new', 'qualified', 'disqualified', 'application_sent', 'completed', 'no_show');

create type notification_channel as enum ('sms', 'email');
create type notification_type as enum (
  'immediate', 'reminder', 'application_link', 'no_month_nudge', 'waitlist_confirmation'
);
create type notification_status as enum ('sent', 'failed', 'skipped');

create type nyc_borough as enum ('bronx', 'brooklyn', 'manhattan', 'queens', 'staten_island');

create type staff_role as enum ('owner', 'admin', 'staff');

-- ---------------------------------------------------------------------------
-- media (referenced by cohorts, page_sections, site_settings)
-- ---------------------------------------------------------------------------

create table media (
  id uuid primary key default gen_random_uuid(),
  storage_bucket text not null default 'site-media',
  storage_path text not null,
  alt_text text,
  width int,
  height int,
  mime_type text,
  size_bytes int,
  uploaded_by uuid,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- cohorts (absorbs "current study" marketing content + active-month config)
-- ---------------------------------------------------------------------------

create table cohorts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  is_current boolean not null default false,
  is_waitlist boolean not null default false,
  study_title text not null,
  study_description text,
  eligibility_notes text,
  duration_text text,
  compensation_usd numeric(10, 2) not null,
  spots_available int,
  image_id uuid references media(id),
  application_link_url text,
  starts_on date not null,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_current_cohort on cohorts (is_current) where is_current;
create unique index one_waitlist_cohort on cohorts (is_waitlist) where is_waitlist;

-- ---------------------------------------------------------------------------
-- flyer_codes + scans (borough attribution)
-- ---------------------------------------------------------------------------

create table flyer_codes (
  code text primary key,
  borough nyc_borough not null,
  campaign_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- leads (one row per application; waitlist unified via lead_source)
-- scans/leads have a circular reference, so leads.source_scan_id FK is
-- added after scans exists (see bottom of file).
-- ---------------------------------------------------------------------------

create table leads (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid references cohorts(id),
  lead_source lead_source not null,
  full_name text not null,
  email text not null,
  phone text not null,
  age smallint check (age between 18 and 120),
  availability lead_availability,
  english_comfort english_comfort,
  referral_source referral_source,
  referral_details text,
  status lead_status not null default 'new',
  disqualify_reason text,
  payout_notes text,
  notes text,
  sms_consent boolean not null default false,
  sms_consent_at timestamptz,
  application_link_sent_at timestamptz,
  source_scan_id uuid,
  created_at timestamptz not null default now(),
  unique (cohort_id, phone)
);

create unique index leads_cohort_email_unique on leads (cohort_id, lower(email));

create table scans (
  id uuid primary key default gen_random_uuid(),
  code text references flyer_codes(code),
  borough nyc_borough not null,
  scanned_at timestamptz not null default now(),
  lead_id uuid references leads(id),
  converted boolean generated always as (lead_id is not null) stored,
  user_agent text,
  referrer text
);

alter table leads
  add constraint leads_source_scan_id_fkey
  foreign key (source_scan_id) references scans(id);

-- ---------------------------------------------------------------------------
-- notification_log (audit trail + dedupe check for automations)
-- ---------------------------------------------------------------------------

create table notification_log (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id),
  channel notification_channel not null,
  type notification_type not null,
  status notification_status not null,
  provider_message_id text,
  error_message text,
  sent_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site content: singleton prose sections + small repeating lists
-- ---------------------------------------------------------------------------

create table page_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique,
  title text,
  body text,
  image_id uuid references media(id),
  is_visible boolean not null default true,
  extra jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  updated_by uuid
);

create table faq_items (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position int not null default 0,
  is_visible boolean not null default true
);

create table how_it_works_steps (
  id uuid primary key default gen_random_uuid(),
  step_number int not null,
  title text not null,
  description text,
  icon text,
  position int not null default 0,
  is_visible boolean not null default true
);

create table stat_items (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  value text not null,
  icon text,
  position int not null default 0,
  is_visible boolean not null default true
);

create table social_links (
  id uuid primary key default gen_random_uuid(),
  platform text not null,
  url text not null,
  position int not null default 0,
  is_visible boolean not null default true
);

-- ---------------------------------------------------------------------------
-- site_settings (single row)
-- ---------------------------------------------------------------------------

create table site_settings (
  id boolean primary key default true,
  primary_color_hex text,
  logo_media_id uuid references media(id),
  favicon_media_id uuid references media(id),
  font_choice text,
  default_meta_title text,
  default_meta_description text,
  og_image_id uuid references media(id),
  contact_email text,
  contact_phone text,
  constraint site_settings_singleton check (id)
);

insert into site_settings (id) values (true);

-- ---------------------------------------------------------------------------
-- staff (admin dashboard auth/roles)
-- ---------------------------------------------------------------------------

create table staff (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role staff_role not null default 'staff',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- fx_rates + cron_run_log (automation infrastructure)
-- ---------------------------------------------------------------------------

create table fx_rates (
  base_currency text not null,
  target_currency text not null,
  rate numeric(18, 6) not null,
  fetched_at timestamptz not null default now(),
  primary key (base_currency, target_currency)
);

create table cron_run_log (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text,
  rows_affected int,
  error text
);

-- ---------------------------------------------------------------------------
-- RLS: enabled everywhere, no policies (deny-by-default for anon/authenticated).
-- service_role bypasses RLS entirely, which is how the app's server-side
-- code (RSC / Route Handlers / Server Actions) reads and writes.
-- ---------------------------------------------------------------------------

alter table media enable row level security;
alter table cohorts enable row level security;
alter table flyer_codes enable row level security;
alter table leads enable row level security;
alter table scans enable row level security;
alter table notification_log enable row level security;
alter table page_sections enable row level security;
alter table faq_items enable row level security;
alter table how_it_works_steps enable row level security;
alter table stat_items enable row level security;
alter table social_links enable row level security;
alter table site_settings enable row level security;
alter table staff enable row level security;
alter table fx_rates enable row level security;
alter table cron_run_log enable row level security;
