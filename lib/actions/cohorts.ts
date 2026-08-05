"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/types";

const cohortSchema = z.object({
  slug: z.string().trim().min(1),
  studyTitle: z.string().trim().min(1),
  studyDescription: z.string().trim().optional(),
  eligibilityNotes: z.string().trim().optional(),
  durationText: z.string().trim().optional(),
  compensationUsd: z.coerce.number().min(0),
  spotsAvailable: z.coerce.number().int().min(0).optional().or(z.literal("")),
  applicationLinkUrl: z.string().trim().optional(),
  isWaitlist: z.coerce.boolean(),
  startsOn: z.string().trim().min(1),
  endsOn: z.string().trim().optional(),
  imageId: z.string().trim().optional(),
});

function parseCohortForm(formData: FormData) {
  return cohortSchema.safeParse({
    slug: formData.get("slug"),
    studyTitle: formData.get("studyTitle"),
    studyDescription: formData.get("studyDescription"),
    eligibilityNotes: formData.get("eligibilityNotes"),
    durationText: formData.get("durationText"),
    compensationUsd: formData.get("compensationUsd"),
    spotsAvailable: formData.get("spotsAvailable"),
    applicationLinkUrl: formData.get("applicationLinkUrl"),
    isWaitlist: formData.get("isWaitlist") === "on",
    startsOn: formData.get("startsOn"),
    endsOn: formData.get("endsOn"),
    imageId: formData.get("imageId"),
  });
}

export async function createCohort(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const parsed = parseCohortForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;
  const db = createServiceRoleClient();

  const { error } = await db.from("cohorts").insert({
    slug: d.slug,
    study_title: d.studyTitle,
    study_description: d.studyDescription || null,
    eligibility_notes: d.eligibilityNotes || null,
    duration_text: d.durationText || null,
    compensation_usd: d.compensationUsd,
    spots_available: d.spotsAvailable === "" ? null : d.spotsAvailable,
    application_link_url: d.applicationLinkUrl || null,
    is_waitlist: d.isWaitlist,
    starts_on: d.startsOn,
    ends_on: d.endsOn || null,
    image_id: d.imageId || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/cohorts");
  redirect("/admin/cohorts");
}

export async function updateCohort(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const parsed = parseCohortForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const d = parsed.data;
  const db = createServiceRoleClient();

  const { error } = await db
    .from("cohorts")
    .update({
      slug: d.slug,
      study_title: d.studyTitle,
      study_description: d.studyDescription || null,
      eligibility_notes: d.eligibilityNotes || null,
      duration_text: d.durationText || null,
      compensation_usd: d.compensationUsd,
      spots_available: d.spotsAvailable === "" ? null : d.spotsAvailable,
      application_link_url: d.applicationLinkUrl || null,
      is_waitlist: d.isWaitlist,
      starts_on: d.startsOn,
      ends_on: d.endsOn || null,
      image_id: d.imageId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/cohorts");
  redirect("/admin/cohorts");
}

export async function setCurrentCohort(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("cohorts").update({ is_current: false }).eq("is_current", true);
  await db.from("cohorts").update({ is_current: true }).eq("id", id);
  revalidatePath("/admin/cohorts");
  revalidatePath("/");
}

export async function deleteCohort(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("cohorts").delete().eq("id", id);
  revalidatePath("/admin/cohorts");
}
