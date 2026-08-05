"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import type { ActionState } from "@/lib/actions/types";
import type { Tables } from "@/lib/database.types";

type Cohort = Tables<"cohorts">;

export function CohortForm({
  cohort,
  action,
}: {
  cohort?: Cohort;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, {
    error: null,
  });

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="studyTitle">Study title</Label>
          <Input
            id="studyTitle"
            name="studyTitle"
            defaultValue={cohort?.study_title}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" defaultValue={cohort?.slug} required />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="studyDescription">Description</Label>
        <Textarea
          id="studyDescription"
          name="studyDescription"
          defaultValue={cohort?.study_description ?? ""}
          rows={3}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="eligibilityNotes">Eligibility notes</Label>
        <Textarea
          id="eligibilityNotes"
          name="eligibilityNotes"
          defaultValue={cohort?.eligibility_notes ?? ""}
          rows={2}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="compensationUsd">Compensation (USD)</Label>
          <Input
            id="compensationUsd"
            name="compensationUsd"
            type="number"
            step="0.01"
            defaultValue={cohort?.compensation_usd ?? undefined}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="durationText">Duration text</Label>
          <Input
            id="durationText"
            name="durationText"
            defaultValue={cohort?.duration_text ?? ""}
            placeholder="~3 hrs & 15 mins"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="spotsAvailable">Spots available</Label>
          <Input
            id="spotsAvailable"
            name="spotsAvailable"
            type="number"
            defaultValue={cohort?.spots_available ?? ""}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="startsOn">Starts on</Label>
          <Input
            id="startsOn"
            name="startsOn"
            type="date"
            defaultValue={cohort?.starts_on ?? ""}
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="endsOn">Ends on</Label>
          <Input
            id="endsOn"
            name="endsOn"
            type="date"
            defaultValue={cohort?.ends_on ?? ""}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="applicationLinkUrl">
          Official application link (sent once qualified)
        </Label>
        <Input
          id="applicationLinkUrl"
          name="applicationLinkUrl"
          type="url"
          defaultValue={cohort?.application_link_url ?? ""}
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="isWaitlist"
          name="isWaitlist"
          defaultChecked={cohort?.is_waitlist}
        />
        <Label htmlFor="isWaitlist" className="font-normal">
          This is a waitlist cohort
        </Label>
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-fit">
        {isPending ? "Saving..." : cohort ? "Save changes" : "Create cohort"}
      </Button>
    </form>
  );
}
