"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/types";

const BUCKET = "site-media";

export async function uploadMedia(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staff = await requireStaffAuth();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { error: "Choose at least one file." };
  }

  const db = createServiceRoleClient();

  for (const file of files) {
    const ext = file.name.includes(".") ? file.name.split(".").pop() : "bin";
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await db.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return { error: `Failed to upload ${file.name}: ${uploadError.message}` };
    }

    const { error: insertError } = await db.from("media").insert({
      storage_bucket: BUCKET,
      storage_path: path,
      alt_text: file.name.replace(/\.[^.]+$/, ""),
      mime_type: file.type || null,
      size_bytes: file.size,
      uploaded_by: staff.id,
    });

    if (insertError) {
      await db.storage.from(BUCKET).remove([path]);
      return { error: `Failed to save ${file.name}: ${insertError.message}` };
    }
  }

  revalidatePath("/admin/media");
  return { error: null, success: true };
}

export async function deleteMedia(id: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();

  const { data: row } = await db
    .from("media")
    .select("storage_bucket, storage_path")
    .eq("id", id)
    .single();

  if (row) {
    await db.storage.from(row.storage_bucket).remove([row.storage_path]);
  }
  await db.from("media").delete().eq("id", id);

  revalidatePath("/admin/media");
}

export async function updateMediaAltText(id: string, altText: string) {
  await requireStaffAuth();
  const db = createServiceRoleClient();
  await db.from("media").update({ alt_text: altText }).eq("id", id);
  revalidatePath("/admin/media");
}
