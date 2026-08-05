"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInApplicant } from "@/lib/actions/account";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/password-input";

export default function AccountLoginPage() {
  const [state, formAction, isPending] = useActionState(
    signInApplicant,
    initialActionState
  );

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-20 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl font-medium">
            Sign in
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Track your application status and history.
          </p>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                name="password"
                autoComplete="current-password"
                required
              />
            </div>
            {state.error && (
              <p className="text-sm text-destructive">{state.error}</p>
            )}
            <Button type="submit" disabled={isPending} className="mt-2">
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No account?{" "}
              <Link href="/account/signup" className="underline">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
