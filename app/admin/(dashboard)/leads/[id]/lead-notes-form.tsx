"use client";

import { useActionState } from "react";
import { updateLeadNotes } from "@/lib/actions/leads-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function LeadNotesForm({
  id,
  notes,
  payoutNotes,
  disqualifyReason,
}: {
  id: string;
  notes: string | null;
  payoutNotes: string | null;
  disqualifyReason: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateLeadNotes.bind(null, id),
    initialActionState
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">Internal notes</Label>
        <Textarea id="notes" name="notes" defaultValue={notes ?? ""} rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="payoutNotes">Payout notes</Label>
        <Textarea
          id="payoutNotes"
          name="payoutNotes"
          defaultValue={payoutNotes ?? ""}
          rows={2}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="disqualifyReason">Disqualify reason</Label>
        <Textarea
          id="disqualifyReason"
          name="disqualifyReason"
          defaultValue={disqualifyReason ?? ""}
          rows={2}
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && <p className="text-sm text-muted-foreground">Saved.</p>}
      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : "Save notes"}
      </Button>
    </form>
  );
}
