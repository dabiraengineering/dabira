"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/lib/actions/leads-admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/lib/database.types";

type LeadStatus = Database["public"]["Enums"]["lead_status"];

const STATUSES: LeadStatus[] = [
  "new",
  "qualified",
  "waitlisted",
  "application_sent",
  "completed",
  "disqualified",
  "no_show",
];

export function LeadStatusSelect({ id, status }: { id: string; status: LeadStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Select
      value={status}
      onValueChange={(value) => {
        if (value) startTransition(() => updateLeadStatus(id, value as LeadStatus));
      }}
    >
      <SelectTrigger disabled={isPending} className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s.replace(/_/g, " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
