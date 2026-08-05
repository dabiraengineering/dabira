-- Seed content mirroring the legacy Carrd site, so the new marketing
-- page has real (editable) data from day one. Admin should review this
-- copy in the dashboard before going live — written from what's visible
-- on the current site, not authoritative legal/compensation text.

insert into cohorts (
  slug, is_current, is_waitlist, study_title, study_description,
  eligibility_notes, duration_text, compensation_usd, starts_on
) values (
  'wristband-research-study', true, false,
  'Wristband Research Study',
  'A paid, in-person session at a professional NYC research facility. You''ll spend about 3 hours testing wristband technology and sharing feedback.',
  'Open to adults available for an in-person session in Midtown Manhattan during business hours.',
  '~3 hrs & 15 mins',
  200.00,
  current_date
);

insert into page_sections (section_key, title, body) values
  ('hero', 'Show up. Get paid.', 'In-person sessions testing real technology. Professional setup, real compensation, limited monthly spots.'),
  ('about', 'We are the bridge between you and the opportunity.', 'Dabira Projects is a New York-based participant recruitment service. We connect everyday people with paid research opportunities from product testing to technology studies. We work with professional research organizations to source qualified participants and ensure a smooth experience.'),
  ('footer', 'Dabira Projects', 'NYC · 2026');

insert into stat_items (label, value, position) values
  ('Per session', '$200', 1),
  ('Duration', '~3 hrs & 15 mins', 2),
  ('Credit to wallet', 'Same day', 3);

insert into how_it_works_steps (step_number, title, description, position) values
  (1, 'Check if you qualify', 'Fill out our short pre-qualification form. Takes about 2 minutes.', 1),
  (2, 'Complete the official application', 'If you qualify, you''ll receive an email with the official application link. Takes about 10 minutes. Select at least one available time slot to improve your chances.', 2),
  (3, 'Attend and get paid', 'If selected, you''ll receive a confirmation email. Arrive 10-15 min early with a valid government-issued ID. $200 credited to your FocusGroup Wallet same day — upon completion of your session.', 3);

insert into faq_items (question, answer, position) values
  ('What to expect', 'A professional, in-person research session at a NYC facility — expect to test the product and answer questions about your experience.', 1),
  ('Compensation & payment', 'Compensation is credited the same day, upon completion of your session. Exact amounts are shown on the current study above.', 2),
  ('Participant selection', 'Applicants are reviewed against the current study''s eligibility criteria; selected participants receive the official application link by email.', 3),
  ('Scheduling priority', 'Sessions are held during regular business hours, Monday through Friday. Availability is requested during the application process.', 4),
  ('Privacy & safety', 'Your information is used solely to process your application and communicate about your session. See our Privacy Policy for details.', 5),
  ('What is a research study?', 'A research study is a professional session where participants test products or technology and share structured feedback with a research team.', 6);

insert into social_links (platform, url, position) values
  ('instagram', 'https://www.instagram.com/dabira_org/', 1),
  ('linkedin', 'https://www.linkedin.com/company/dabira-projects/', 2),
  ('tiktok', 'https://www.tiktok.com/@dabira_projects', 3);

update site_settings set
  default_meta_title = 'Dabira Projects — Paid Research Studies in NYC',
  default_meta_description = 'Show up, get paid. Dabira Projects connects everyday people with paid, in-person research studies in New York City.',
  contact_email = 'projectassistance@dabira.org'
where id = true;
