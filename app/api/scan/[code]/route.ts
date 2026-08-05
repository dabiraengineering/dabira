import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Real-time, event-driven — not cron. This directly replaces the legacy
// webhook -> Make.com -> HTTP chain that had a 23/26 error rate: one
// INSERT + redirect, no external dependency to misconfigure.
export async function GET(
  request: Request,
  { params }: RouteContext<"/api/scan/[code]">
) {
  const { code } = await params;
  const db = createServiceRoleClient();

  const { data: flyerCode } = await db
    .from("flyer_codes")
    .select("code, borough, is_active")
    .eq("code", code)
    .maybeSingle();

  const applyUrl = new URL("/apply", request.url);

  if (!flyerCode || !flyerCode.is_active) {
    return NextResponse.redirect(applyUrl);
  }

  const { data: scan } = await db
    .from("scans")
    .insert({
      code: flyerCode.code,
      borough: flyerCode.borough,
      user_agent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
    })
    .select("id")
    .single();

  const response = NextResponse.redirect(applyUrl);

  if (scan) {
    response.cookies.set("scan_id", scan.id, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24h — long enough to fill out the form
      path: "/",
    });
  }

  return response;
}
