import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { MediaOption } from "@/components/media-picker";

export async function getMediaOptions(): Promise<MediaOption[]> {
  const db = createServiceRoleClient();
  const { data } = await db
    .from("media")
    .select("id, storage_bucket, storage_path, alt_text")
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    altText: row.alt_text,
    url: db.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data
      .publicUrl,
  }));
}
