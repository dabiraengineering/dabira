import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Badge } from "@/components/ui/badge";
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
          {(leads ?? []).map((lead) => (
            <TableRow key={lead.id} className="cursor-pointer">
              <TableCell className="font-medium">
                <Link href={`/admin/leads/${lead.id}`} className="hover:underline">
                  {lead.full_name}
                </Link>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {lead.email}
                <br />
                {lead.phone}
              </TableCell>
              <TableCell className="text-sm">
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
          {(!leads || leads.length === 0) && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-sm text-muted-foreground">
                No leads yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
