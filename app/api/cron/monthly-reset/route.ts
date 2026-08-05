import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runCronJob } from "@/lib/cron-log";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Runs daily; only actually acts on the 1st of the month. Does NOT
// blindly flip is_current — if the admin hasn't finished configuring
// next month's cohort yet, flipping would publish an empty/broken
// "current study" section. Skips (and logs) instead.
export async function GET(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const nyDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    day: "numeric",
  }).format(new Date());

  if (Number(nyDate) !== 1) {
    return NextResponse.json({ skipped: true, reason: "not the 1st" });
  }

  const result = await runCronJob("monthly-reset", async () => {
    const db = createServiceRoleClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: candidate } = await db
      .from("cohorts")
      .select("id, study_title, compensation_usd, starts_on")
      .eq("is_current", false)
      .lte("starts_on", today)
      .not("study_title", "is", null)
      .not("compensation_usd", "is", null)
      .order("starts_on", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!candidate) {
      throw new Error(
        "No fully-configured next cohort found to roll over to — admin needs to set one up."
      );
    }

    await db.from("cohorts").update({ is_current: false }).eq("is_current", true);
    await db.from("cohorts").update({ is_current: true }).eq("id", candidate.id);

    return { rowsAffected: 1 };
  });

  return NextResponse.json(result);
}
