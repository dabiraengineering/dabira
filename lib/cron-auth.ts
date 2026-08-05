import "server-only";
import crypto from "node:crypto";
import { NextResponse } from "next/server";

// Independent of proxy.ts / requireStaffAuth() — cron routes are hit by
// Supabase pg_net, not a logged-in staff session, and are authenticated
// with their own bearer secret.
export function verifyCronSecret(request: Request): NextResponse | null {
  const auth = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SHARED_SECRET}`;

  const a = Buffer.from(auth);
  const b = Buffer.from(expected);
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
