"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { ActionState } from "@/lib/actions/types";

export async function signUpApplicant(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName || null } },
  });

  if (error) {
    return { error: error.message };
  }

  // Link any past anonymous applications made with this email so the
  // applicant sees their existing history immediately, not just new ones.
  if (data.user) {
    const db = createServiceRoleClient();
    await db
      .from("leads")
      .update({ user_id: data.user.id })
      .is("user_id", null)
      .ilike("email", email);
  }

  if (!data.session) {
    return {
      error: null,
      success: true, // confirmation email required before sign-in works
    };
  }

  redirect("/account");
}

export async function signInApplicant(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  // Staff and applicant accounts share the same Supabase Auth users, so
  // it's easy to land here (e.g. via the header's account icon) with
  // staff credentials. Send them straight to the dashboard instead of
  // leaving them on the applicant portal wondering where the admin
  // side went.
  const db = createServiceRoleClient();
  const { data: staffRecord } = await db
    .from("staff")
    .select("id")
    .eq("id", data.user.id)
    .eq("is_active", true)
    .maybeSingle();

  redirect(staffRecord ? "/admin" : "/account");
}

export async function signOutApplicant() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}
