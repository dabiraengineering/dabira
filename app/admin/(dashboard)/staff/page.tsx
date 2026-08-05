import { requireStaffAuth } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StaffRow } from "./staff-row";
import { InviteStaffForm } from "./invite-staff-form";

export default async function StaffPage() {
  const currentStaff = await requireStaffAuth();
  const db = createServiceRoleClient();
  const { data: staff } = await db
    .from("staff")
    .select("*")
    .order("created_at", { ascending: true });

  const canManage = currentStaff.role === "owner";

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Staff</h1>

      {canManage && <InviteStaffForm />}
      {!canManage && (
        <p className="text-sm text-muted-foreground">
          Only owners can invite staff or change roles.
        </p>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(staff ?? []).map((s) => (
            <StaffRow
              key={s.id}
              id={s.id}
              fullName={s.full_name}
              role={s.role}
              isActive={s.is_active}
              canManage={canManage}
              isSelf={s.id === currentStaff.id}
            />
          ))}
          {(!staff || staff.length === 0) && (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                No staff yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
