"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";

export type MediaOption = { id: string; url: string; altText: string | null };

export function MediaPicker({
  name,
  media,
  defaultValue,
}: {
  name: string;
  media: MediaOption[];
  defaultValue?: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    defaultValue ?? null
  );
  const [open, setOpen] = useState(false);
  const selected = media.find((m) => m.id === selectedId);

  return (
    <div className="flex items-center gap-3">
      <input type="hidden" name={name} value={selectedId ?? ""} />
      {selected ? (
        <div className="relative h-20 w-20 overflow-hidden rounded-md border">
          <Image src={selected.url} alt={selected.altText ?? ""} fill className="object-cover" />
        </div>
      ) : (
        <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button type="button" variant="outline" size="sm" />} nativeButton={false}>
          {selected ? "Change image" : "Choose image"}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose from media library</DialogTitle>
          </DialogHeader>
          {media.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No media uploaded yet — add some in the Media library first.
            </p>
          ) : (
            <div className="grid max-h-[60vh] grid-cols-4 gap-3 overflow-y-auto">
              {media.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setOpen(false);
                  }}
                  className="relative aspect-square overflow-hidden rounded-md border transition-all hover:ring-2 hover:ring-ring"
                >
                  <Image src={item.url} alt={item.altText ?? ""} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selected && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setSelectedId(null)}
        >
          <X /> Remove
        </Button>
      )}
    </div>
  );
}
