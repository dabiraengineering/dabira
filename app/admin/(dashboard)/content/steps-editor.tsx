"use client";

import { useActionState, useRef, useTransition, useEffect } from "react";
import {
  createStep,
  updateStep,
  toggleStepVisible,
  deleteStep,
} from "@/lib/actions/content-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import type { Tables } from "@/lib/database.types";

function StepRow({ item }: { item: Tables<"how_it_works_steps"> }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <form
          action={(formData) => startTransition(() => updateStep(item.id, formData))}
          className="flex flex-col gap-3"
        >
          <div className="grid grid-cols-[auto_1fr_auto] gap-3">
            <Input
              name="stepNumber"
              type="number"
              defaultValue={item.step_number}
              className="w-16"
              title="Step #"
            />
            <Input name="title" defaultValue={item.title} placeholder="Title" />
            <Input
              name="position"
              type="number"
              defaultValue={item.position}
              className="w-20"
              title="Position"
            />
          </div>
          <Textarea
            name="description"
            defaultValue={item.description ?? ""}
            rows={2}
            placeholder="Description"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={item.is_visible}
                onCheckedChange={(checked) =>
                  startTransition(() => toggleStepVisible(item.id, checked))
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
                onClick={() => startTransition(() => deleteStep(item.id))}
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

function NewStepForm({ nextPosition }: { nextPosition: number }) {
  const [state, formAction, isPending] = useActionState(createStep, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <form ref={formRef} action={formAction} className="flex flex-col gap-3">
          <input type="hidden" name="position" value={nextPosition} />
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Input name="stepNumber" type="number" defaultValue={nextPosition} className="w-16" />
            <Input name="title" placeholder="New step title" required />
          </div>
          <Textarea name="description" rows={2} placeholder="Description" />
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" size="sm" disabled={isPending} className="w-fit">
            {isPending ? "Adding..." : "Add step"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function StepsEditor({ items }: { items: Tables<"how_it_works_steps">[] }) {
  const nextPosition = items.length > 0 ? Math.max(...items.map((i) => i.position)) + 1 : 1;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <StepRow key={item.id} item={item} />
      ))}
      <NewStepForm nextPosition={nextPosition} />
    </div>
  );
}
