import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export type StaffRole = "owner" | "admin" | "staff";

export type AuthenticatedStaff = {
  id: string;
  fullName: string | null;
  role: StaffRole;
};

// The real authorization check. proxy.ts only does an optimistic cookie
// check for UX redirects — every admin page and every mutating Server
// Action/Route Handler must call this itself (Next.js 16: proxy-based
// gating does not protect Server Actions on its own).
export async function requireStaffAuth(): Promise<AuthenticatedStaff> {
  const supabase = await createSupabaseServerClient();

  // getUser() (not getSession()) re-validates the JWT against Supabase
  // Auth rather than trusting an unverified cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const db = createServiceRoleClient();
  const { data: staff } = await db
    .from("staff")
    .select("id, full_name, role, is_active")
    .eq("id", user.id)
    .single();

  if (!staff || !staff.is_active) {
    redirect("/admin/login");
  }

  return { id: staff.id, fullName: staff.full_name, role: staff.role };
}

export function requireRole(staff: AuthenticatedStaff, roles: StaffRole[]) {
  if (!roles.includes(staff.role)) {
    throw new Error("Forbidden");
  }
}
