import "server-only";
import { sendSms, sendEmail } from "@/lib/twilio";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/database.types";
import type { EmailTemplate } from "@/lib/notifications/email-templates";

type NotificationType = Database["public"]["Enums"]["notification_type"];

async function logNotification(
  leadId: string,
  channel: "sms" | "email",
  type: NotificationType,
  result: { ok: true; providerId: string } | { ok: false; error: string }
) {
  const db = createServiceRoleClient();
  await db.from("notification_log").insert({
    lead_id: leadId,
    channel,
    type,
    status: result.ok ? "sent" : "failed",
    provider_message_id: result.ok ? result.providerId : null,
    error_message: result.ok ? null : result.error,
  });
}

export async function sendLeadSms(
  leadId: string,
  phone: string,
  type: NotificationType,
  body: string
) {
  const result = await sendSms(phone, body);
  await logNotification(leadId, "sms", type, result);
  return result;
}

export async function sendLeadEmail(
  leadId: string,
  email: string,
  type: NotificationType,
  template: EmailTemplate
) {
  const result = await sendEmail(email, template.subject, template.html, template.text);
  await logNotification(leadId, "email", type, result);
  return result;
}
