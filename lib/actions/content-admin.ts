"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/types";

function revalidateContent() {
  revalidatePath("/admin/content");
  revalidatePath("/");
}

// --- page_sections (hero, about, footer, legal pages) ---

export async function updatePageSection(
  sectionKey: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staff = await requireStaffAuth();
  const db = createServiceRoleClient();
  const { error } = await db
    .from("page_sections")
    .update({
      title: String(formData.get("title") ?? "") || null,
      body: String(formData.get("body") ?? "") || null,
      image_id: String(formData.get("imageId") ?? "") || null,
      is_visible: formData.get("isVisible") === "on",
      updated_at: new Date().toISOString(),
      updated_by: staff.id,
    })
    .eq("section_key", sectionKey);

  if (error) return { error: error.message };
  revalidateContent();
  return { error: null, success: true };
}

// --- faq_items ---

export async function createFaqItem(_prevState: ActionState, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  const { error } = await db.from("faq_items").insert({
    question: String(formData.get("question") ?? ""),
    answer: String(formData.get("answer") ?? ""),
    position: Number(formData.get("position") ?? 0),
  });
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null, success: true };
}

export async function updateFaqItem(id: string, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db
    .from("faq_items")
    .update({
      question: String(formData.get("question") ?? ""),
      answer: String(formData.get("answer") ?? ""),
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);
  revalidateContent();
}

export async function toggleFaqVisible(id: string, isVisible: boolean) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("faq_items").update({ is_visible: isVisible }).eq("id", id);
  revalidateContent();
}

export async function deleteFaqItem(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("faq_items").delete().eq("id", id);
  revalidateContent();
}

// --- how_it_works_steps ---

export async function createStep(_prevState: ActionState, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  const { error } = await db.from("how_it_works_steps").insert({
    step_number: Number(formData.get("stepNumber") ?? 1),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    position: Number(formData.get("position") ?? 0),
  });
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null, success: true };
}

export async function updateStep(id: string, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db
    .from("how_it_works_steps")
    .update({
      step_number: Number(formData.get("stepNumber") ?? 1),
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);
  revalidateContent();
}

export async function toggleStepVisible(id: string, isVisible: boolean) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("how_it_works_steps").update({ is_visible: isVisible }).eq("id", id);
  revalidateContent();
}

export async function deleteStep(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("how_it_works_steps").delete().eq("id", id);
  revalidateContent();
}

// --- stat_items ---

export async function createStat(_prevState: ActionState, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  const { error } = await db.from("stat_items").insert({
    label: String(formData.get("label") ?? ""),
    value: String(formData.get("value") ?? ""),
    position: Number(formData.get("position") ?? 0),
  });
  if (error) return { error: error.message };
  revalidateContent();
  return { error: null, success: true };
}

export async function updateStat(id: string, formData: FormData) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db
    .from("stat_items")
    .update({
      label: String(formData.get("label") ?? ""),
      value: String(formData.get("value") ?? ""),
      position: Number(formData.get("position") ?? 0),
    })
    .eq("id", id);
  revalidateContent();
}

export async function toggleStatVisible(id: string, isVisible: boolean) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("stat_items").update({ is_visible: isVisible }).eq("id", id);
  revalidateContent();
}

export async function deleteStat(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("stat_items").delete().eq("id", id);
  revalidateContent();
}
