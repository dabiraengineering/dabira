"use client";

import { useTransition } from "react";
import Link from "next/link";
import { setCurrentCohort, deleteCohort } from "@/lib/actions/cohorts";
import { Button } from "@/components/ui/button";

export function CohortRowActions({
  id,
  isCurrent,
}: {
  id: string;
  isCurrent: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex justify-end gap-2">
      {!isCurrent && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => startTransition(() => setCurrentCohort(id))}
        >
          Set current
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        render={<Link href={`/admin/cohorts/${id}`} />}
        nativeButton={false}
      >
        Edit
      </Button>
      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this cohort?")) {
            startTransition(() => deleteCohort(id));
          }
        }}
      >
        Delete
      </Button>
    </div>
  );
}
