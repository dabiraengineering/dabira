import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  new: "outline",
  qualified: "secondary",
  waitlisted: "secondary",
  application_sent: "default",
  completed: "default",
  disqualified: "destructive",
  no_show: "destructive",
};

export default async function LeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  const { status } = await searchParams;
  const db = createServiceRoleClient();

  let query = db
    .from("leads")
    .select("id, full_name, email, phone, status, lead_source, created_at, cohorts(study_title)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (typeof status === "string" && status !== "all") {
    query = query.eq("status", status as never);
  }

  const { data: leads } = await query;

  const statuses = [
    "all",
    "new",
    "qualified",
    "waitlisted",
    "application_sent",
    "completed",
    "disqualified",
    "no_show",
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Leads</h1>

      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/leads" : `/admin/leads?status=${s}`}
            className="text-xs"
          >
            <Badge variant={(!status && s === "all") || status === s ? "default" : "outline"}>
              {s.replace(/_/g, " ")}
            </Badge>
          </Link>
        ))}
      </div>

      {(!leads || leads.length === 0) && (
        <p className="text-center text-sm text-muted-foreground">No leads yet.</p>
      )}

      {/* Mobile: card list — a 6-column table doesn't fit a phone screen
          usefully even with horizontal scroll, so this is a distinct
          layout rather than a squeezed table. */}
      {leads && leads.length > 0 && (
        <div className="flex flex-col gap-3 md:hidden">
          {leads.map((lead) => (
            <Link key={lead.id} href={`/admin/leads/${lead.id}`}>
              <Card>
                <CardContent className="flex flex-col gap-1.5 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium">{lead.full_name}</span>
                    <Badge variant={STATUS_VARIANT[lead.status] ?? "outline"} className="shrink-0">
                      {lead.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{lead.email}</p>
                  <p className="text-xs text-muted-foreground">{lead.phone}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{lead.cohorts?.study_title ?? "—"}</span>
                    <span>{new Date(lead.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Desktop: full table */}
      {leads && leads.length > 0 && (
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Study</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer">
                  <TableCell className="max-w-40 truncate font-medium">
                    <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                      {lead.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48 text-xs text-muted-foreground">
                    <p className="truncate">{lead.email}</p>
                    <p>{lead.phone}</p>
                  </TableCell>
                  <TableCell className="max-w-32 truncate text-sm">
                    {lead.cohorts?.study_title ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm capitalize">
                    {lead.lead_source.replace(/_/g, " ")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[lead.status] ?? "outline"}>
                      {lead.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
