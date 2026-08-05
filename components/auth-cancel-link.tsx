import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function AuthCancelLink() {
  return (
    <Link
      href="/"
      className="flex items-center justify-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
    >
      <ArrowLeft className="h-3 w-3" />
      Cancel and return to home
    </Link>
  );
}
