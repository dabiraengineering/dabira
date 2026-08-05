"use client";

import { useActionState } from "react";
import { updateSiteSettings } from "@/lib/actions/settings-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaPicker, type MediaOption } from "@/components/media-picker";
import type { Tables } from "@/lib/database.types";

export function SiteSettingsForm({
  settings,
  media,
}: {
  settings: Tables<"site_settings"> | null;
  media: MediaOption[];
}) {
  const [state, formAction, isPending] = useActionState(
    updateSiteSettings,
    initialActionState
  );

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="primaryColorHex">Brand color (hex)</Label>
        <div className="flex items-center gap-2">
          <Input
            id="primaryColorHex"
            name="primaryColorHex"
            defaultValue={settings?.primary_color_hex ?? ""}
            placeholder="#2f6f64"
            className="w-40"
          />
          <input
            type="color"
            defaultValue={settings?.primary_color_hex ?? "#2f6f64"}
            onChange={(e) => {
              const input = document.getElementById(
                "primaryColorHex"
              ) as HTMLInputElement | null;
              if (input) input.value = e.target.value;
            }}
            className="h-9 w-9 cursor-pointer rounded border"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Logo</Label>
        <MediaPicker
          name="logoMediaId"
          media={media}
          defaultValue={settings?.logo_media_id}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Favicon</Label>
        <MediaPicker
          name="faviconMediaId"
          media={media}
          defaultValue={settings?.favicon_media_id}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="defaultMetaTitle">Default page title (SEO)</Label>
        <Input
          id="defaultMetaTitle"
          name="defaultMetaTitle"
          defaultValue={settings?.default_meta_title ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="defaultMetaDescription">Default meta description (SEO)</Label>
        <Textarea
          id="defaultMetaDescription"
          name="defaultMetaDescription"
          defaultValue={settings?.default_meta_description ?? ""}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactEmail">Contact email</Label>
          <Input
            id="contactEmail"
            name="contactEmail"
            type="email"
            defaultValue={settings?.contact_email ?? ""}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contactPhone">Contact phone</Label>
          <Input
            id="contactPhone"
            name="contactPhone"
            defaultValue={settings?.contact_phone ?? ""}
          />
        </div>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-muted-foreground">Saved.</p>}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
