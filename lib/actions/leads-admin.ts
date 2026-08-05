"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/database.types";
import type { ActionState } from "@/lib/actions/types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

export async function updateLeadStatus(id: string, status: LeadStatus) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
}

export async function updateLeadNotes(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  const { error } = await db
    .from("leads")
    .update({
      notes: String(formData.get("notes") ?? "") || null,
      payout_notes: String(formData.get("payoutNotes") ?? "") || null,
      disqualify_reason: String(formData.get("disqualifyReason") ?? "") || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath(`/admin/leads/${id}`);
  return { error: null, success: true };
}

export async function deleteLead(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("leads").delete().eq("id", id);
  revalidatePath("/admin/leads");
}
