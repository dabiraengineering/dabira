import "server-only";
import twilioSdk from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;

let client: ReturnType<typeof twilioSdk> | null = null;
function getClient() {
  if (!client) client = twilioSdk(accountSid, authToken);
  return client;
}

export type SendResult = { ok: true; providerId: string } | { ok: false; error: string };

export async function sendSms(to: string, body: string): Promise<SendResult> {
  try {
    const message = await getClient().messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER!,
      body,
    });
    return { ok: true, providerId: message.sid };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown SMS error" };
  }
}

// Twilio's unified Email API (comms.twilio.com) — REST, not SMTP, and not
// the classic SendGrid API. Auth is core Account SID + Auth Token, same
// credential as SMS.
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendResult> {
  try {
    const res = await fetch("https://comms.twilio.com/v1/Emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
      },
      body: JSON.stringify({
        from: { address: process.env.TWILIO_FROM_EMAIL!, name: "Dabira Projects" },
        to: [{ address: to }],
        content: { subject, html, text },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Twilio Email API ${res.status}: ${body}` };
    }

    const data = (await res.json()) as { operationId?: string };
    return { ok: true, providerId: data.operationId ?? "unknown" };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error" };
  }
}
