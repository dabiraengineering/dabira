"use client";

import { useActionState, useRef, useTransition, useEffect } from "react";
import {
  createStat,
  updateStat,
  toggleStatVisible,
  deleteStat,
} from "@/lib/actions/content-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";

function StatRow({ item }: { item: Tables<"stat_items"> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <form
          action={(formData) => startTransition(() => updateStat(item.id, formData))}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3">
            <Input name="value" defaultValue={item.value} placeholder="Value ($200)" />
            <Input name="label" defaultValue={item.label} placeholder="Label (Per session)" />
            <Input
              name="position"
              type="number"
              defaultValue={item.position}
              className="w-20"
              title="Position"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={item.is_visible}
                onCheckedChange={(checked) =>
                  startTransition(() => toggleStatVisible(item.id, checked))
                }
              />
              <Label className="font-normal text-xs text-muted-foreground">Visible</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" variant="outline" disabled={isPending}>
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={() => startTransition(() => deleteStat(item.id))}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function NewStatForm({ nextPosition }: { nextPosition: number }) {
  const [state, formAction, isPending] = useActionState(createStat, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="position" value={nextPosition} />
          <div className="grid grid-cols-2 gap-3">
            <Input name="value" placeholder="Value ($200)" required />
            <Input name="label" placeholder="Label (Per session)" required />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" size="sm" disabled={isPending} className="w-fit">
            {isPending ? "Adding..." : "Add stat"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function StatsEditor({ items }: { items: Tables<"stat_items">[] }) {
  const nextPosition = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 1;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <StatRow key={item.id} item={item} />
      ))}
      <NewStatForm nextPosition={nextPosition} />
    </div>
  );
}
