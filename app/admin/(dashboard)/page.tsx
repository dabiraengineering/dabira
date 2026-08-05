import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function AdminHomePage() {
  const db = createServiceRoleClient();
  const [{ count: newLeads }, { count: pendingScans }] = await Promise.all([
    db
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    db
      .from("scans")
      .select("id", { count: "exact", head: true })
      .eq("converted", false),
  ]);

  const cards = [
    {
      href: "/admin/leads",
      title: "New leads",
      value: newLeads ?? 0,
      description: "Applications awaiting review",
    },
    {
      href: "/admin/scans",
      title: "Unconverted scans",
      value: pendingScans ?? 0,
      description: "Flyer scans without a linked lead",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <Link key={card.href} href={card.href}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardDescription>{card.title}</CardDescription>
                <CardTitle className="text-3xl">{card.value}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
