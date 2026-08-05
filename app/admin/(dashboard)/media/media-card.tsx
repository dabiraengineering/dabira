"use client";

import { useTransition } from "react";
import Image from "next/image";
import { deleteMedia, updateMediaAltText } from "@/lib/actions/media";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function MediaCard({
  id,
  url,
  altText,
}: {
  id: string;
  url: string;
  altText: string | null;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-2">
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Image src={url} alt={altText ?? ""} fill className="object-cover" />
      </div>
      <Input
        defaultValue={altText ?? ""}
        placeholder="Alt text"
        className="h-8 text-xs"
        onBlur={(e) => {
          const value = e.target.value;
          startTransition(() => {
            updateMediaAltText(id, value);
          });
        }}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => deleteMedia(id))}
      >
        <Trash2 className="text-destructive" /> Delete
      </Button>
    </div>
  );
}
