import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runCronJob } from "@/lib/cron-log";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendLeadSms } from "@/lib/notifications/send";
import { smsNoMonthNudge } from "@/lib/notifications/sms-templates";

// SMS spec §SMS 4 ("No month selected" nudge) — runs DAILY, targets
// leads waitlisted >24h ago who haven't received the nudge yet. Anchored
// on created_at (the spec explicitly allows Submission Date as a
// fallback anchor when a more specific "email sent" timestamp isn't
// reliable — our schema doesn't carry a distinct one, so this is that
// fallback used directly).
export async function GET(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const result = await runCronJob("no-month-nudge", async () => {
    const db = createServiceRoleClient();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: leads } = await db
      .from("leads")
      .select("id, full_name, phone, sms_consent, created_at")
      .eq("status", "waitlisted")
      .is("availability", null)
      .lte("created_at", cutoff);

    let sent = 0;
    for (const lead of leads ?? []) {
      if (!lead.sms_consent) continue;

      const { data: alreadySent } = await db
        .from("notification_log")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("type", "no_month_nudge")
        .maybeSingle();
      if (alreadySent) continue;

      const firstName = lead.full_name.trim().split(/\s+/)[0];
      await sendLeadSms(lead.id, lead.phone, "no_month_nudge", smsNoMonthNudge(firstName));
      sent++;
    }

    return { rowsAffected: sent };
  });

  return NextResponse.json(result);
}
