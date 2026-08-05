"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn, requestLoginCode, verifyLoginCode } from "@/lib/actions/auth";
import { initialActionState } from "@/lib/actions/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OtpField } from "@/components/otp-field";
import { PasswordInput } from "@/components/password-input";

function PasswordLogin({ onUseCode }: { onUseCode: () => void }) {
  const [state, formAction, isPending] = useActionState(signIn, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/admin/forgot-password"
            className="text-xs text-muted-foreground hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          id="password"
          name="password"
          autoComplete="current-password"
          required
        />
      </div>
      {state.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="mt-2">
        {isPending ? "Signing in..." : "Sign in"}
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={onUseCode}>
        Sign in with an emailed code instead
      </Button>
    </form>
  );
}

function CodeLogin({ onUsePassword }: { onUsePassword: () => void }) {
  const [email, setEmail] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [requestState, requestAction, isRequesting] = useActionState(
    requestLoginCode,
    initialActionState
  );
  const [verifyState, verifyAction, isVerifying] = useActionState(
    verifyLoginCode,
    initialActionState
  );

  if (!codeSent) {
    return (
      <form
        action={async (formData) => {
          await requestAction(formData);
          setCodeSent(true);
        }}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <Label htmlFor="code-email">Email</Label>
          <Input
            id="code-email"
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
          {isRequesting ? "Sending..." : "Send me a code"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onUsePassword}>
          Back to password sign-in
        </Button>
      </form>
    );
  }

  return (
    <form action={verifyAction} className="flex flex-col gap-4">
      <input type="hidden" name="email" value={email} />
      <p className="text-sm text-muted-foreground">
        Enter the 6-digit code sent to {email}.
      </p>
      <div className="flex flex-col gap-2">
        <Label>Code</Label>
        <OtpField name="token" autoFocus />
      </div>
      {verifyState.error && (
        <p className="text-sm text-destructive">{verifyState.error}</p>
      )}
      <Button type="submit" disabled={isVerifying} className="mt-2">
        {isVerifying ? "Verifying..." : "Verify and sign in"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"password" | "code">("password");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Dabira Admin</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "password" ? (
            <PasswordLogin onUseCode={() => setMode("code")} />
          ) : (
            <CodeLogin onUsePassword={() => setMode("password")} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
