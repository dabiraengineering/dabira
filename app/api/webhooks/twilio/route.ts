import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

const STOP_KEYWORDS = ["stop", "stopall", "unsubscribe", "cancel", "end", "quit"];
const START_KEYWORDS = ["start", "yes", "unstop"];

// Twilio signs every webhook request so it can't be spoofed to flip
// someone's SMS consent flag by posting a fake STOP. Algorithm per
// Twilio's docs: HMAC-SHA1 of (full URL + sorted POST param key+value
// pairs concatenated), base64-encoded, compared to X-Twilio-Signature.
function verifyTwilioSignature(
  url: string,
  params: Record<string, string>,
  signature: string | null
): boolean {
  if (!signature) return false;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;

  const data =
    url +
    Object.keys(params)
      .sort()
      .map((key) => key + params[key])
      .join("");

  const expected = crypto.createHmac("sha1", authToken).update(data, "utf8").digest("base64");

  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    params[key] = String(value);
  }

  const signature = request.headers.get("x-twilio-signature");
  if (!verifyTwilioSignature(request.url, params, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const from = params.From;
  const body = (params.Body ?? "").trim().toLowerCase();
  const db = createServiceRoleClient();

  if (from && STOP_KEYWORDS.includes(body)) {
    await db.from("leads").update({ sms_consent: false }).eq("phone", from);
  } else if (from && START_KEYWORDS.includes(body)) {
    await db
      .from("leads")
      .update({ sms_consent: true, sms_consent_at: new Date().toISOString() })
      .eq("phone", from);
  }

  // Empty TwiML — no auto-reply beyond what Twilio's own STOP/START
  // carrier-level handling already sends.
  return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}
