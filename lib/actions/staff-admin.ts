"use server";

import { revalidatePath } from "next/cache";
import { requireStaffAuth, requireRole } from "@/lib/dal";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { Database } from "@/lib/database.types";
import type { ActionState } from "@/lib/actions/types";

type StaffRole = Database["public"]["Enums"]["staff_role"];

export async function inviteStaff(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const staff = await requireStaffAuth();
  requireRole(staff, ["owner"]);

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const role = String(formData.get("role") ?? "staff") as StaffRole;

  if (!email) return { error: "Email is required." };

  const db = createServiceRoleClient();

  // Sends an email with a link to set their password — no temp password
  // to generate or share out-of-band.
  const { data, error } = await db.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName || null },
  });

  if (error) return { error: error.message };

  const { error: staffError } = await db.from("staff").insert({
    id: data.user.id,
    full_name: fullName || null,
    role,
    is_active: true,
  });

  if (staffError) return { error: staffError.message };

  revalidatePath("/admin/staff");
  return { error: null, success: true };
}

export async function updateStaffRole(id: string, role: StaffRole) {
  const staff = await requireStaffAuth();
  requireRole(staff, ["owner"]);

  const db = createServiceRoleClient();
  await db.from("staff").update({ role }).eq("id", id);
  revalidatePath("/admin/staff");
}

export async function toggleStaffActive(id: string, isActive: boolean) {
  const staff = await requireStaffAuth();
  requireRole(staff, ["owner"]);

  const db = createServiceRoleClient();
  await db.from("staff").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/staff");
}
