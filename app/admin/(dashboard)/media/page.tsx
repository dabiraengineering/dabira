import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { MediaUploadForm } from "./media-upload-form";
import { MediaCard } from "./media-card";

export default async function MediaPage() {
  const db = createServiceRoleClient();
  const { data: media } = await db
    .from("media")
    .select("id, storage_bucket, storage_path, alt_text")
    .order("created_at", { ascending: false });

  const items = (media ?? []).map((row) => ({
    id: row.id,
    altText: row.alt_text,
    url: db.storage.from(row.storage_bucket).getPublicUrl(row.storage_path).data
      .publicUrl,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Media library</h1>
      <MediaUploadForm />
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((item) => (
            <MediaCard key={item.id} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}
