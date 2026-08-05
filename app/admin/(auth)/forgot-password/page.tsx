"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { requestPasswordReset, resetPassword } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpField } from "@/components/otp-field";
import { PasswordInput } from "@/components/password-input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [requestState, requestAction, isRequesting] = useActionState(
    requestPasswordReset,
    initialActionState
  );
  const [resetState, resetAction, isResetting] = useActionState(
    resetPassword,
    initialActionState
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
        </CardHeader>
        <CardContent>
          {!codeSent ? (
            <form
              action={async (formData) => {
                await requestAction(formData);
                setCodeSent(true);
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {requestState.error && (
                <p className="text-sm text-destructive">{requestState.error}</p>
              )}
              <Button type="submit" disabled={isRequesting} className="mt-2">
                {isRequesting ? "Sending..." : "Send reset code"}
              </Button>
              <Link
                href="/admin/login"
                className="text-center text-xs text-muted-foreground hover:underline"
              >
                Back to sign in
              </Link>
            </form>
          ) : (
            <form action={resetAction} className="flex flex-col gap-4">
              <input type="hidden" name="email" value={email} />
              <p className="text-sm text-muted-foreground">
                Enter the 6-digit code sent to {email} and a new password.
              </p>
              <div className="flex flex-col gap-2">
                <Label>Code</Label>
                <OtpField name="token" autoFocus />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">New password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
              </div>
              {resetState.error && (
                <p className="text-sm text-destructive">{resetState.error}</p>
              )}
              <Button type="submit" disabled={isResetting} className="mt-2">
                {isResetting ? "Saving..." : "Set new password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
