"use client";

import { useActionState, useRef, useEffect } from "react";
import { inviteStaff } from "@/lib/actions/staff-admin";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function InviteStaffForm() {
  const [state, formAction, isPending] = useActionState(inviteStaff, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <Input name="fullName" placeholder="Full name" className="w-48" />
      <Input name="email" type="email" placeholder="Email" className="w-64" required />
      <Select name="role" defaultValue="staff">
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Sending invite..." : "Invite"}
      </Button>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state.success && (
        <p className="text-sm text-muted-foreground">Invite sent.</p>
      )}
    </form>
  );
}
