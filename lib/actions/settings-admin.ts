"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/types";

function revalidateSettings() {
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

export async function updateSiteSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const db = createServiceRoleClient();

  const primaryColorHex = String(formData.get("primaryColorHex") ?? "").trim();
  if (primaryColorHex && !/^#[0-9a-f]{6}$/i.test(primaryColorHex)) {
    return { error: "Primary color must be a hex code like #2f6f64." };
  }

  const { error } = await db
    .from("site_settings")
    .update({
      primary_color_hex: primaryColorHex || null,
      logo_media_id: String(formData.get("logoMediaId") ?? "") || null,
      favicon_media_id: String(formData.get("faviconMediaId") ?? "") || null,
      default_meta_title: String(formData.get("defaultMetaTitle") ?? "") || null,
      default_meta_description:
        String(formData.get("defaultMetaDescription") ?? "") || null,
      contact_email: String(formData.get("contactEmail") ?? "") || null,
      contact_phone: String(formData.get("contactPhone") ?? "") || null,
    })
    .eq("id", true);

  if (error) return { error: error.message };
  revalidateSettings();
  return { error: null, success: true };
}

export async function createSocialLink(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  const platform = String(formData.get("platform") ?? "").trim().toLowerCase();
  const url = String(formData.get("url") ?? "").trim();

  if (!platform || !url) return { error: "Platform and URL are required." };

  const { data: existing } = await db
    .from("social_links")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await db.from("social_links").insert({
    platform,
    url,
    position: (existing?.position ?? 0) + 1,
  });

  if (error) return { error: error.message };
  revalidateSettings();
  return { error: null, success: true };
}

export async function toggleSocialLinkVisible(id: string, isVisible: boolean) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("social_links").update({ is_visible: isVisible }).eq("id", id);
  revalidateSettings();
}

export async function deleteSocialLink(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("social_links").delete().eq("id", id);
  revalidateSettings();
}
