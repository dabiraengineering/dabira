import { NextResponse } from "next/server";
import { verifyCronSecret } from "@/lib/cron-auth";
import { runCronJob } from "@/lib/cron-log";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function GET(request: Request) {
  const unauthorized = verifyCronSecret(request);
  if (unauthorized) return unauthorized;

  const result = await runCronJob("refresh-fx-rates", async () => {
    const res = await fetch("https://api.frankfurter.app/latest?base=USD");
    if (!res.ok) throw new Error(`Frankfurter fetch failed: ${res.status}`);
    const { rates } = (await res.json()) as { rates: Record<string, number> };

    const db = createServiceRoleClient();
    const rows = Object.entries(rates).map(([target, rate]) => ({
      base_currency: "USD",
      target_currency: target,
      rate,
      fetched_at: new Date().toISOString(),
    }));

    const { error } = await db
      .from("fx_rates")
      .upsert(rows, { onConflict: "base_currency,target_currency" });
    if (error) throw new Error(error.message);

    return { rowsAffected: rows.length };
  });

  return NextResponse.json(result);
}
