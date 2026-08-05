import { getMediaOptions } from "@/lib/media";
import { MediaUploadForm } from "./media-upload-form";
import { MediaCard } from "./media-card";

export default async function MediaPage() {
  const items = await getMediaOptions();

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
