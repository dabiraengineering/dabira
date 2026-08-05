import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ThankYouPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-10">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <h1 className="font-heading text-2xl font-medium">
            Application received
          </h1>
          <p className="text-muted-foreground">
            Thanks for applying. If you qualify, you&apos;ll receive the
            official application link by email shortly.
          </p>
          <Button render={<Link href="/" />} nativeButton={false} variant="outline" className="mt-2">
            Back to home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
