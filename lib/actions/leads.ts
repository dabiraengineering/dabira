"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendLeadSms, sendLeadEmail } from "@/lib/notifications/send";
import { smsImmediate } from "@/lib/notifications/sms-templates";
import { applicationEmail } from "@/lib/notifications/email-templates";
import type { ActionState } from "@/lib/actions/types";

const applicationSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  age: z.coerce.number().int().min(18, "Must be 18 or older.").max(120),
  availability: z.enum(["first_half", "second_half"]),
  englishComfort: z.enum(["yes", "no", "somewhat"]),
  referralSource: z.enum([
    "friend",
    "instagram",
    "tiktok",
    "linkedin",
    "flyer",
    "other",
  ]),
  referralDetails: z.string().trim().optional(),
  smsConsent: z.coerce.boolean(),
});

// Best-effort E.164 normalization for US numbers, matching the format
// the legacy Airtable system already stored ("+1XXXXXXXXXX").
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

export async function submitApplication(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = applicationSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    age: formData.get("age"),
    availability: formData.get("availability"),
    englishComfort: formData.get("englishComfort"),
    referralSource: formData.get("referralSource"),
    referralDetails: formData.get("referralDetails"),
    smsConsent: formData.get("smsConsent") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form and try again." };
  }

  const data = parsed.data;
  const phone = normalizePhone(data.phone);
  const db = createServiceRoleClient();

  // If the visitor is already signed in with an applicant account,
  // attach this submission to it so it shows up in "My applications".
  const authClient = await createSupabaseServerClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const { data: cohort } = await db
    .from("cohorts")
    .select("id, compensation_usd, application_link_url")
    .eq("is_current", true)
    .single();

  if (!cohort) {
    return { error: "Applications aren't open right now — check back soon." };
  }

  const { data: existing } = await db
    .from("leads")
    .select("id")
    .eq("cohort_id", cohort.id)
    .or(`phone.eq.${phone},email.ilike.${data.email}`)
    .maybeSingle();

  if (existing) {
    return { error: "You've already applied for this study." };
  }

  // "Immediate" path (SMS spec §SMS 1): the window is already open, so the
  // application email + SMS go out right away instead of waiting on the
  // cron-driven reminder/delivery flow used for waitlisted leads.
  const sendsImmediately = Boolean(cohort.application_link_url);

  const { data: inserted, error: insertError } = await db
    .from("leads")
    .insert({
      cohort_id: cohort.id,
      lead_source: "study_application",
      full_name: data.fullName,
      email: data.email,
      phone,
      age: data.age,
      availability: data.availability,
      english_comfort: data.englishComfort,
      referral_source: data.referralSource,
      referral_details: data.referralDetails || null,
      sms_consent: data.smsConsent,
      sms_consent_at: data.smsConsent ? new Date().toISOString() : null,
      status: sendsImmediately ? "application_sent" : "new",
      application_link_sent_at: sendsImmediately ? new Date().toISOString() : null,
      user_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { error: "Something went wrong submitting your application." };
  }

  if (sendsImmediately && cohort.application_link_url) {
    const firstName = data.fullName.trim().split(/\s+/)[0];
    await sendLeadEmail(
      inserted.id,
      data.email,
      "immediate",
      applicationEmail({
        firstName,
        applicationLink: cohort.application_link_url,
        compensationUsd: Number(cohort.compensation_usd),
      })
    );
    if (data.smsConsent) {
      await sendLeadSms(inserted.id, phone, "immediate", smsImmediate(firstName));
    }
  }

  redirect("/apply/thank-you");
}
