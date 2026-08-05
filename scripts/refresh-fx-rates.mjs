// One-off / manually-runnable version of the future pg_cron-triggered FX
// refresh job. Usage: node scripts/refresh-fx-rates.mjs
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const res = await fetch("https://api.frankfurter.app/latest?base=USD");
if (!res.ok) {
  console.error("Frankfurter fetch failed:", res.status);
  process.exit(1);
}
const { rates } = await res.json();

const rows = Object.entries(rates).map(([target, rate]) => ({
  base_currency: "USD",
  target_currency: target,
  rate,
  fetched_at: new Date().toISOString(),
}));

const { error } = await db
  .from("fx_rates")
  .upsert(rows, { onConflict: "base_currency,target_currency" });

if (error) {
  console.error("Upsert failed:", error.message);
  process.exit(1);
}

console.log(`Upserted ${rows.length} FX rates.`);
