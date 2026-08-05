"use client";

import { useActionState, useEffect, useRef } from "react";
import { createFlyerCode } from "@/lib/actions/scans-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BOROUGHS = ["bronx", "brooklyn", "manhattan", "queens", "staten_island"];

export function FlyerCodeForm() {
  const [state, formAction, isPending] = useActionState(
    createFlyerCode,
    initialActionState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-wrap items-end gap-3 rounded-lg border p-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="code">Code</Label>
        <Input id="code" name="code" placeholder="brooklyn-subway-01" className="w-48" required />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="borough">Borough</Label>
        <Select name="borough" defaultValue="manhattan">
          <SelectTrigger id="borough" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {BOROUGHS.map((b) => (
              <SelectItem key={b} value={b}>
                {b.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="campaignLabel">Campaign label</Label>
        <Input id="campaignLabel" name="campaignLabel" placeholder="Optional" className="w-48" />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding..." : "Add code"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
    </form>
  );
}
