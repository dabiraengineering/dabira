"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/types";

export async function signIn(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect("/admin");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// --- Sign in with a 6-digit emailed code, instead of a password ---

export async function requestLoginCode(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "Email is required." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false },
  });

  if (error) return { error: "Could not send a code to that email." };
  return { error: null, success: true };
}

export async function verifyLoginCode(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const token = String(formData.get("token") ?? "");
  if (!email || !token) return { error: "Enter the 6-digit code." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });

  if (error) return { error: "That code is invalid or expired." };
  redirect("/admin");
}

// --- Forgot password: emailed 6-digit code + new password, one flow ---

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  if (!email) return { error: "Email is required." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) return { error: "Could not send a reset code to that email." };
  return { error: null, success: true };
}

export async function resetPassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "");
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !token || !password) {
    return { error: "Fill in the code and a new password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createSupabaseServerClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "recovery",
  });
  if (verifyError) return { error: "That code is invalid or expired." };

  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) return { error: "Could not update the password." };

  redirect("/admin");
}
