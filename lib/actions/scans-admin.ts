"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/database.types";
import type { ActionState } from "@/lib/actions/types";

type Borough = Database["public"]["Enums"]["nyc_borough"];

export async function createFlyerCode(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const code = String(formData.get("code") ?? "").trim().toLowerCase();
  const borough = String(formData.get("borough") ?? "") as Borough;
  const campaignLabel = String(formData.get("campaignLabel") ?? "").trim();

  if (!code || !borough) {
    return { error: "Code and borough are required." };
  }

  const db = createServiceRoleClient();
  const { error } = await db.from("flyer_codes").insert({
    code,
    borough,
    campaign_label: campaignLabel || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/scans");
  return { error: null, success: true };
}

export async function toggleFlyerCodeActive(code: string, isActive: boolean) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("flyer_codes").update({ is_active: isActive }).eq("code", code);
  revalidatePath("/admin/scans");
}

export async function deleteFlyerCode(code: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("flyer_codes").delete().eq("code", code);
  revalidatePath("/admin/scans");
}
