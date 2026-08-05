"use client";

import { useTransition } from "react";
import { updateStaffRole, toggleStaffActive } from "@/lib/actions/staff-admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TableCell, TableRow } from "@/components/ui/table";
import type { Database } from "@/lib/database.types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export function StaffRow({
  id,
  fullName,
  role,
  isActive,
  canManage,
  isSelf,
}: {
  id: string;
  fullName: string | null;
  role: StaffRole;
  isActive: boolean;
  canManage: boolean;
  isSelf: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell className="font-medium">
        {fullName ?? "—"} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
      </TableCell>
      <TableCell>
        {canManage ? (
          <Select
            value={role}
            onValueChange={(value) =>
              value && startTransition(() => updateStaffRole(id, value as StaffRole))
            }
          >
            <SelectTrigger disabled={isPending || isSelf} className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className="text-sm capitalize">{role}</span>
        )}
      </TableCell>
      <TableCell>
        {canManage ? (
          <Switch
            checked={isActive}
            disabled={isPending || isSelf}
            onCheckedChange={(checked) =>
              startTransition(() => toggleStaffActive(id, checked))
            }
          />
        ) : (
          <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
        )}
      </TableCell>
    </TableRow>
  );
}
