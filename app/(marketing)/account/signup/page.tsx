"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpApplicant } from "@/lib/actions/account";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";

export default function AccountSignupPage() {
  const [state, formAction, isPending] = useActionState(
    signUpApplicant,
    initialActionState
  );

  if (state.success) {
    return (
      <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20 sm:px-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Check your email to confirm your account, then sign in.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-medium">
            Create an account
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Optional — track your application status and skip re-entering
            your info next time. You can still apply without one.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already have an account?{" "}
              <Link href="/account/login" className="underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
