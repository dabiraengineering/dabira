"use client";

import { useActionState, useRef, useTransition, useEffect } from "react";
import {
  createSocialLink,
  toggleSocialLinkVisible,
  deleteSocialLink,
} from "@/lib/actions/settings-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SocialIcon } from "@/components/social-icon";
import { Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";

function SocialLinkRow({ item }: { item: Tables<"social_links"> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <SocialIcon platform={item.platform} className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium capitalize">{item.platform}</p>
        <p className="truncate text-xs text-muted-foreground">{item.url}</p>
      </div>
      <Switch
        checked={item.is_visible}
        disabled={isPending}
        onCheckedChange={(checked) =>
          startTransition(() => toggleSocialLinkVisible(item.id, checked))
        }
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => deleteSocialLink(item.id))}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}

export function SocialLinksEditor({ items }: { items: Tables<"social_links">[] }) {
  const [state, formAction, isPending] = useActionState(
    createSocialLink,
    initialActionState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <SocialLinkRow key={item.id} item={item} />
      ))}
      <form ref={formRef} action={formAction} className="flex items-end gap-2">
        <div className="flex-1">
          <Input name="platform" placeholder="instagram, linkedin, tiktok..." required />
        </div>
        <div className="flex-[2]">
          <Input name="url" type="url" placeholder="https://..." required />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Adding..." : "Add"}
        </Button>
      </form>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </div>
  );
}
