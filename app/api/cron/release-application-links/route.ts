import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runCronJob } from "@/lib/cron-log";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendLeadSms, sendLeadEmail } from "@/lib/notifications/send";
import { smsDelivery } from "@/lib/notifications/sms-templates";
import { applicationEmail } from "@/lib/notifications/email-templates";

// SMS spec §SMS 3 ("We've sent it") — the waitlist-promotion path. SMS 1
// (immediate path, same-day qualify) is handled directly in
// lib/actions/leads.ts at submission time; this job is what promotes a
// previously-waitlisted lead once their chosen half-month window opens.
// The 4 legacy "Send Application" Make scenarios (First/Second Half x
// Current/Waitlist Month) collapse into this one handler — cohort and
// availability already on the row decide content and timing, so there's
// no need for 4 near-duplicate scenarios.
export async function GET(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const result = await runCronJob("release-application-links", async () => {
    const db = createServiceRoleClient();

    const { data: leads } = await db
      .from("leads")
      .select(
        "id, full_name, email, phone, sms_consent, availability, cohort_id, cohorts(compensation_usd, application_link_url, starts_on)"
      )
      .eq("status", "waitlisted")
      .is("application_link_sent_at", null);

    let sent = 0;
    const today = new Date();

    for (const lead of leads ?? []) {
      if (!lead.cohorts?.application_link_url || !lead.availability) continue;

      const monthStart = new Date(lead.cohorts.starts_on);
      const windowOpensOn = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        lead.availability === "first_half" ? 1 : 16
      );
      if (today < windowOpensOn) continue; // window hasn't opened yet

      const firstName = lead.full_name.trim().split(/\s+/)[0];

      await sendLeadEmail(
        lead.id,
        lead.email,
        "delivery",
        applicationEmail({
          firstName,
          applicationLink: lead.cohorts.application_link_url,
          compensationUsd: Number(lead.cohorts.compensation_usd),
        })
      );
      if (lead.sms_consent) {
        await sendLeadSms(lead.id, lead.phone, "delivery", smsDelivery(firstName));
      }

      await db
        .from("leads")
        .update({
          status: "application_sent",
          application_link_sent_at: new Date().toISOString(),
        })
        .eq("id", lead.id);

      sent++;
    }

    return { rowsAffected: sent };
  });

  return NextResponse.json(result);
}
