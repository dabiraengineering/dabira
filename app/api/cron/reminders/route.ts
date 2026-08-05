import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runCronJob } from "@/lib/cron-log";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { sendLeadSms } from "@/lib/notifications/send";
import { smsReminder } from "@/lib/notifications/sms-templates";

// SMS spec §SMS 2 ("Sending this week" reminder). pg_cron fires this
// HOURLY (not at a fixed UTC time) because a hardcoded UTC hour drifts
// against America/New_York across DST twice a year — instead this
// handler checks the current NY wall-clock hour itself and no-ops
// outside the 9am window, letting Node's always-current tz database
// handle DST correctness instead of crontab arithmetic.
export async function GET(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const nyHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );

  if (nyHour !== 9) {
    return NextResponse.json({ skipped: true, reason: "not 9am NY" });
  }

  const result = await runCronJob("reminders", async () => {
    const db = createServiceRoleClient();

    const { data: leads } = await db
      .from("leads")
      .select("id, full_name, phone, sms_consent, availability, cohort_id, cohorts(study_title, starts_on)")
      .eq("status", "waitlisted")
      .not("availability", "is", null);

    let sent = 0;
    for (const lead of leads ?? []) {
      if (!lead.sms_consent || !lead.cohorts) continue;

      const { data: alreadySent } = await db
        .from("notification_log")
        .select("id")
        .eq("lead_id", lead.id)
        .eq("type", "reminder")
        .maybeSingle();
      if (alreadySent) continue;

      const monthStart = new Date(lead.cohorts.starts_on);
      const windowOpensOn = new Date(
        monthStart.getFullYear(),
        monthStart.getMonth(),
        lead.availability === "first_half" ? 1 : 16
      );
      const daysUntil = Math.round(
        (windowOpensOn.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntil !== 2) continue;

      const firstName = lead.full_name.trim().split(/\s+/)[0];
      const monthName = monthStart.toLocaleString("en-US", { month: "long" });
      const half = lead.availability === "first_half" ? "First" : "Second";

      await sendLeadSms(
        lead.id,
        lead.phone,
        "reminder",
        smsReminder(firstName, monthName, half)
      );
      sent++;
    }

    return { rowsAffected: sent };
  });

  return NextResponse.json(result);
}
