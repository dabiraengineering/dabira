"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { uploadMedia } from "@/lib/actions/media";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, X } from "lucide-react";

export function MediaUploadForm() {
  const [state, formAction, isPending] = useActionState(
    uploadMedia,
    initialActionState
  );
  const [selected, setSelected] = useState<File[]>([]);
  const previewsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewsRef.current = selected.map((f) => URL.createObjectURL(f));
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, [selected]);

  useEffect(() => {
    if (state.success) {
      setSelected([]);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [state.success]);

  function removeAt(index: number) {
    setSelected((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form
      action={(formData) => {
        formData.delete("files");
        selected.forEach((file) => formData.append("files", file));
        formAction(formData);
      }}
      className="flex flex-col gap-3 rounded-lg border border-dashed p-4"
    >
      <div className="flex items-center gap-3">
        <Input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setSelected(Array.from(e.target.files ?? []))}
          className="max-w-sm"
        />
        <Button type="submit" disabled={isPending || selected.length === 0}>
          <UploadCloud />
          {isPending ? "Uploading..." : `Upload ${selected.length || ""}`.trim()}
        </Button>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {selected.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative h-20 w-20">
              {/* Local pre-upload preview via object URL — not yet in Supabase Storage */}
              <img
                src={previewsRef.current[i]}
                alt={file.name}
                className="h-20 w-20 rounded-md border object-cover"
              />
              <button
                type="button"
                onClick={() => removeAt(i)}
                className="absolute -right-2 -top-2 rounded-full bg-background border shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </form>
  );
}
