// One-time Airtable -> Supabase migration (Phase 6).
// Usage: node scripts/migrate-airtable.mjs [--dry-run]
//
// Field-mapping decisions (documented, not silently guessed):
// - Age was only ever stored as a bracket in Airtable (our schema wants
//   an exact integer) -> migrated as the bracket midpoint.
// - Airtable's "Month Assigned" blank state (waitlisted, no month
//   picked yet) doesn't have a cohort to attach to in our schema (every
//   lead needs a cohort_id) -> assigned to the current cohort, status
//   stays 'waitlisted', real availability preserved. Documented
//   simplification, not a bug.
// - "How Did You Hear" values outside our fixed enum collapse into
//   'other', with the original label preserved in referral_details.
// - SMS 1-4 checkboxes become best-effort notification_log rows
//   (channel sms, status sent, no provider_message_id since the
//   original Twilio SID wasn't stored in Airtable).

import { createClient } from "@supabase/supabase-js";

const DRY_RUN = process.argv.includes("--dry-run");
const AIRTABLE_BASE = "app48GTy0R6qEadYL";
const LEADS_TABLE = "tbl6QO9O5RTt4BbYg";
const SCANS_TABLE = "tblJMthdAmKYtxbdp";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function airtableFetch(tableId, offset) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${tableId}`);
  if (offset) url.searchParams.set("offset", offset);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
  });
  if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function airtableFetchAll(tableId) {
  let records = [];
  let offset;
  do {
    const page = await airtableFetch(tableId, offset);
    records = records.concat(page.records);
    offset = page.offset;
  } while (offset);
  return records;
}

const AGE_MIDPOINT = {
  "1–17": 16, "1-17": 16,
  "18–24": 21, "18-24": 21,
  "25–34": 29, "25-34": 29,
  "35–44": 39, "35-44": 39,
  "45–54": 49, "45-54": 49,
  "55–65": 60, "55-65": 60,
  "66+": 70,
};

function mapAvailability(name) {
  if (!name) return null;
  if (name.startsWith("First half")) return "first_half";
  if (name.startsWith("Second half")) return "second_half";
  return null; // "I'm not available at this time"
}

function mapEnglishComfort(name) {
  if (name === "Yes") return "yes";
  if (name === "No") return "no";
  return null;
}

const REFERRAL_MAP = {
  Instagram: "instagram",
  TikTok: "tiktok",
  LinkedIn: "linkedin",
  "Friend/Family": "friend",
};

function mapReferralSource(name) {
  return REFERRAL_MAP[name] ?? (name ? "other" : null);
}

function mapStatus(name) {
  switch (name) {
    case "Qualified": return "qualified";
    case "Disqualified": return "disqualified";
    case "Application Sent": return "application_sent";
    case "Waitlisted": return "waitlisted";
    default: return "new";
  }
}

function normalizePhone(raw) {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

async function ensureCohortForMonth(monthName, currentCohortId, cache) {
  if (!monthName) return currentCohortId; // undocumented-month fallback
  if (cache.has(monthName)) return cache.get(monthName);

  const [monthWord, yearStr] = monthName.split(" ");
  const monthIndex = new Date(`${monthWord} 1, ${yearStr}`).getMonth();
  const startsOn = `${yearStr}-${String(monthIndex + 1).padStart(2, "0")}-01`;

  const { data: existing } = await db
    .from("cohorts")
    .select("id")
    .eq("starts_on", startsOn)
    .maybeSingle();

  if (existing) {
    cache.set(monthName, existing.id);
    return existing.id;
  }

  if (DRY_RUN) {
    console.log(`[dry-run] would create cohort for ${monthName} (${startsOn})`);
    cache.set(monthName, `dry-run-${monthName}`);
    return cache.get(monthName);
  }

  const { data: created, error } = await db
    .from("cohorts")
    .insert({
      slug: `wristband-research-study-${startsOn}`,
      study_title: "Wristband Research Study",
      compensation_usd: 200,
      starts_on: startsOn,
      is_current: false,
    })
    .select("id")
    .single();
  if (error) throw error;

  cache.set(monthName, created.id);
  return created.id;
}

async function migrateLeads() {
  console.log("Fetching Airtable leads...");
  const records = await airtableFetchAll(LEADS_TABLE);
  console.log(`Fetched ${records.length} leads.`);

  const { data: currentCohort } = await db
    .from("cohorts")
    .select("id")
    .eq("is_current", true)
    .single();
  if (!currentCohort) throw new Error("No current cohort found — seed one first.");

  const cohortCache = new Map();
  const leadIdByAirtableId = new Map();
  let migrated = 0;
  let skipped = 0;

  for (const record of records) {
    const f = record.fields;
    const fullName = f["Full Name"];
    const email = f["Email"];
    const phone = normalizePhone(f["Phone Number"]);

    if (!fullName || !email || !phone) {
      skipped++;
      continue;
    }

    const monthName = f["Month Assigned"] ?? null;
    const cohortId = await ensureCohortForMonth(monthName, currentCohort.id, cohortCache);

    const row = {
      airtable_record_id: record.id,
      cohort_id: cohortId,
      lead_source: "study_application",
      full_name: fullName,
      email,
      phone,
      age: AGE_MIDPOINT[f["Age"]] ?? null,
      availability: mapAvailability(f["Availability"]),
      english_comfort: mapEnglishComfort(f["English Comfortable"] ?? f[" English Comfortable"]),
      referral_source: mapReferralSource(f["How Did You Hear"]),
      referral_details: f["How Did You Hear — Details"] ?? f["How Did You Hear"] ?? null,
      status: mapStatus(f["Status"]),
      disqualify_reason: f["Disqualify Reason"] ?? null,
      payout_notes: f["Payout Notes"] ?? null,
      notes: f["Notes"] ?? null,
      sms_consent: true, // implicit in the legacy Tally form for all these records
      application_link_sent_at: f["Application Sent Date"] ?? null,
      created_at: f["Submission Date"] ?? record.createdTime,
    };

    if (DRY_RUN) {
      migrated++;
      continue;
    }

    const { data: upserted, error } = await db
      .from("leads")
      .upsert(row, { onConflict: "airtable_record_id" })
      .select("id")
      .single();

    if (error) {
      console.error(`Failed to migrate lead ${record.id} (${email}):`, error.message);
      continue;
    }

    leadIdByAirtableId.set(record.id, upserted.id);

    // Best-effort notification_log rows from the legacy SMS-sent checkboxes.
    const smsFlags = [
      [f["SMS 1 (Immediate Sent)"], "immediate"],
      [f["SMS 2 (Reminder Sent)"], "reminder"],
      [f["SMS 3 (Delivery Sent)"], "delivery"],
      [f["SMS 4 (No Month Nudge Sent)"], "no_month_nudge"],
    ];
    for (const [flag, type] of smsFlags) {
      if (!flag) continue;
      await db.from("notification_log").insert({
        lead_id: upserted.id,
        channel: "sms",
        type,
        status: "sent",
      });
    }

    migrated++;
  }

  console.log(`Leads: ${migrated} migrated, ${skipped} skipped (missing name/email/phone).`);
  return leadIdByAirtableId;
}

async function migrateScans(leadIdByAirtableId) {
  console.log("Fetching Airtable scans...");
  const records = await airtableFetchAll(SCANS_TABLE);
  console.log(`Fetched ${records.length} scans.`);

  let migrated = 0;
  for (const record of records) {
    const f = record.fields;
    const borough = f["Borough"]?.toLowerCase().replace(/\s+/g, "_");
    if (!borough) continue;

    const linkedLeadAirtableId = f["Linked Lead"]?.[0];
    const leadId = linkedLeadAirtableId
      ? leadIdByAirtableId.get(linkedLeadAirtableId)
      : null;

    if (DRY_RUN) {
      migrated++;
      continue;
    }

    const { error } = await db.from("scans").upsert(
      {
        airtable_record_id: record.id,
        borough,
        scanned_at: f["Scan Timestamp"] ?? record.createdTime,
        lead_id: leadId ?? null,
      },
      { onConflict: "airtable_record_id" }
    );
    if (error) console.error(`Failed to migrate scan ${record.id}:`, error.message);
    else migrated++;
  }

  console.log(`Scans: ${migrated} migrated.`);
}

async function main() {
  if (DRY_RUN) console.log("=== DRY RUN — no writes will be made ===");
  const leadIdByAirtableId = await migrateLeads();
  await migrateScans(leadIdByAirtableId);
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
