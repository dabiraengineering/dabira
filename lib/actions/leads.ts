"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
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
  const db = createServiceRoleClient();

  const { data: cohort } = await db
    .from("cohorts")
    .select("id")
    .eq("is_current", true)
    .single();

  if (!cohort) {
    return { error: "Applications aren't open right now — check back soon." };
  }

  const { data: existing } = await db
    .from("leads")
    .select("id")
    .eq("cohort_id", cohort.id)
    .or(`phone.eq.${data.phone},email.ilike.${data.email}`)
    .maybeSingle();

  if (existing) {
    return { error: "You've already applied for this study." };
  }

  const { error: insertError } = await db.from("leads").insert({
    cohort_id: cohort.id,
    lead_source: "study_application",
    full_name: data.fullName,
    email: data.email,
    phone: data.phone,
    age: data.age,
    availability: data.availability,
    english_comfort: data.englishComfort,
    referral_source: data.referralSource,
    referral_details: data.referralDetails || null,
    sms_consent: data.smsConsent,
    sms_consent_at: data.smsConsent ? new Date().toISOString() : null,
  });

  if (insertError) {
    return { error: "Something went wrong submitting your application." };
  }

  redirect("/apply/thank-you");
}
