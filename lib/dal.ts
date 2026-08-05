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

export type AuthenticatedApplicant = { id: string; email: string | null };

// Applicant accounts are optional (see lib/actions/account.ts) — anyone
// can still apply anonymously. This just gates the /account dashboard
// for whoever chose to create one.
export async function requireApplicantAuth(): Promise<AuthenticatedApplicant> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  return { id: user.id, email: user.email ?? null };
}
