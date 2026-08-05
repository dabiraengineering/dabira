"use client";

import { useActionState } from "react";
import { updatePageSection } from "@/lib/actions/content-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaPicker, type MediaOption } from "@/components/media-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionEditor({
  sectionKey,
  label,
  title,
  body,
  imageId,
  isVisible,
  media,
  showImage = true,
}: {
  sectionKey: string;
  label: string;
  title: string | null;
  body: string | null;
  imageId: string | null;
  isVisible: boolean;
  media: MediaOption[];
  showImage?: boolean;
}) {
  const [state, formAction, isPending] = useActionState(
    updatePageSection.bind(null, sectionKey),
    initialActionState
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${sectionKey}-title`}>Title</Label>
            <Input id={`${sectionKey}-title`} name="title" defaultValue={title ?? ""} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`${sectionKey}-body`}>Body</Label>
            <Textarea
              id={`${sectionKey}-body`}
              name="body"
              defaultValue={body ?? ""}
              rows={4}
            />
          </div>
          {showImage && (
            <div className="flex flex-col gap-2">
              <Label>Image</Label>
              <MediaPicker name="imageId" media={media} defaultValue={imageId} />
            </div>
          )}
          <div className="flex items-center gap-2">
            <Switch id={`${sectionKey}-visible`} name="isVisible" defaultChecked={isVisible} />
            <Label htmlFor={`${sectionKey}-visible`} className="font-normal">
              Visible on site
            </Label>
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" disabled={isPending} className="w-fit">
            {isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
