import Link from "next/link";
import { Menu, User } from "lucide-react";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SocialIcon } from "@/components/social-icon";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { href: "/#study", label: "Current study" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#about", label: "About" },
];

export default async function MarketingLayout({
  children,
}: LayoutProps<"/">) {
  const db = createServiceRoleClient();
  const authClient = await createSupabaseServerClient();
  const [{ data: settings }, { data: socials }, { data: { user } }] = await Promise.all([
    db.from("site_settings").select("contact_email").single(),
    db
      .from("social_links")
      .select("platform, url")
      .eq("is_visible", true)
      .order("position"),
    authClient.auth.getUser(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="font-heading text-lg font-semibold">
            Dabira Projects
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              render={<Link href={user ? "/account" : "/account/login"} />}
              nativeButton={false}
              variant="ghost"
              size="icon"
              aria-label="My account"
            >
              <User />
            </Button>
            <Button
              render={<Link href="/apply" />}
              nativeButton={false}
              className="hidden sm:inline-flex"
            >
              Apply now
            </Button>

            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" />
                }
              >
                <Menu />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 px-4">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-md px-2 py-3 text-sm hover:bg-muted"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Button render={<Link href="/apply" />} nativeButton={false} className="mt-4">
                    Apply now
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t bg-muted/30">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="font-heading text-lg font-semibold">
              Dabira Projects
            </span>
            <div className="flex items-center gap-4">
              {(socials ?? []).map((social) => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  <SocialIcon platform={social.platform} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} Dabira Projects. NYC.</p>
            <div className="flex gap-4">
              <Link href="/legal/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="hover:underline">
                Terms &amp; Conditions
              </Link>
              {settings?.contact_email && (
                <a
                  href={`mailto:${settings.contact_email}`}
                  className="hover:underline"
                >
                  {settings.contact_email}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
