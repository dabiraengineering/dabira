import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Every cron handler's outcome lands here — directly targets the silent-
// failure problem the old Make.com scenarios had (23/26 and 7/34 error
// rates going unnoticed). Surfaced in the admin dashboard.
export async function runCronJob(
  jobName: string,
  fn: () => Promise<{ rowsAffected: number }>
): Promise<{ rowsAffected: number }> {
  const db = createServiceRoleClient();
  const startedAt = new Date().toISOString();

  try {
    const result = await fn();
    await db.from("cron_run_log").insert({
      job_name: jobName,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      status: "success",
      rows_affected: result.rowsAffected,
    });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db.from("cron_run_log").insert({
      job_name: jobName,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
      status: "error",
      error: message,
    });
    throw err;
  }
}
