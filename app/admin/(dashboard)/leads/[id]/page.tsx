import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LeadStatusSelect } from "./lead-status-select";
import { LeadNotesForm } from "./lead-notes-form";

export default async function LeadDetailPage({
  params,
}: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const db = createServiceRoleClient();

  const [{ data: lead }, { data: notifications }] = await Promise.all([
    db.from("leads").select("*, cohorts(study_title)").eq("id", id).single(),
    db
      .from("notification_log")
      .select("*")
      .eq("lead_id", id)
      .order("sent_at", { ascending: false }),
  ]);

  if (!lead) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{lead.full_name}</h1>
          <p className="text-sm text-muted-foreground">
            {lead.cohorts?.study_title ?? "No cohort"} &middot; applied{" "}
            {new Date(lead.created_at).toLocaleString()}
          </p>
        </div>
        <LeadStatusSelect id={lead.id} status={lead.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p>{lead.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p>{lead.phone}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Age</p>
            <p>{lead.age ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Availability</p>
            <p className="capitalize">{lead.availability?.replace(/_/g, " ") ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">English comfort</p>
            <p className="capitalize">{lead.english_comfort ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Referral source</p>
            <p className="capitalize">
              {lead.referral_source?.replace(/_/g, " ") ?? "—"}
              {lead.referral_details ? ` — ${lead.referral_details}` : ""}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">SMS consent</p>
            <p>
              {lead.sms_consent ? (
                <Badge variant="secondary">Consented</Badge>
              ) : (
                <Badge variant="outline">No</Badge>
              )}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Application link sent</p>
            <p>
              {lead.application_link_sent_at
                ? new Date(lead.application_link_sent_at).toLocaleString()
                : "Not yet"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <LeadNotesForm
            id={lead.id}
            notes={lead.notes}
            payoutNotes={lead.payout_notes}
            disqualifyReason={lead.disqualify_reason}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification history</CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notifications sent yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((n, i) => (
                <div key={n.id}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {n.channel} &middot; {n.type.replace(/_/g, " ")}
                    </span>
                    <Badge variant={n.status === "sent" ? "secondary" : "destructive"}>
                      {n.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(n.sent_at).toLocaleString()}
                  </p>
                  {n.error_message && (
                    <p className="text-xs text-destructive">{n.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
