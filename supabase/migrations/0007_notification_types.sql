-- The SMS spec (Dabira_SMS_Implementation_Spec.pdf) revealed two gaps
-- against the legacy Airtable model:
--   1. A distinct "waitlisted" lifecycle status (pre-qualified, no
--      month/window assigned yet) separate from qualified/disqualified.
--   2. A 4th notification type ("delivery" / SMS 3, "we've sent it",
--      fired when a previously-waitlisted lead's application email
--      actually goes out) distinct from "immediate" (SMS 1, fired for
--      leads who qualify while their window is already open).

alter type lead_status add value if not exists 'waitlisted' after 'qualified';
alter type notification_type add value if not exists 'delivery' after 'application_link';
