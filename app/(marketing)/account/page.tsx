import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireApplicantAuth } from "@/lib/dal";
import { signOutApplicant } from "@/lib/actions/account";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  new: "Received",
  qualified: "Qualified",
  waitlisted: "Waitlisted",
  disqualified: "Not selected",
  application_sent: "Application sent",
  completed: "Completed",
  no_show: "No-show",
};

export default async function AccountPage() {
  const applicant = await requireApplicantAuth();
  const db = createServiceRoleClient();
  const [{ data: leads }, { data: staffRecord }] = await Promise.all([
    db
      .from("leads")
      .select("id, status, created_at, cohorts(study_title)")
      .eq("user_id", applicant.id)
      .order("created_at", { ascending: false }),
    db
      .from("staff")
      .select("id")
      .eq("id", applicant.id)
      .eq("is_active", true)
      .maybeSingle(),
  ]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-16 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-medium">My applications</h1>
          <p className="text-sm text-muted-foreground">{applicant.email}</p>
        </div>
        <form action={signOutApplicant}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </div>

      {/* This account also has staff access — this page will never show
          an admin dashboard link on its own, so surface the way there
          directly rather than leaving staff stuck on the applicant
          portal after using the wrong login page. */}
      {staffRecord && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-2 text-sm">
              <ShieldCheck className="h-4 w-4 text-primary" />
              This account also has admin access.
            </div>
            <Button size="sm" render={<Link href="/admin" />} nativeButton={false}>
              Go to dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {!leads || leads.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No applications yet — apply to a study and it&apos;ll show up here.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {leads.map((lead) => (
            <Card key={lead.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-medium">
                  {lead.cohorts?.study_title ?? "Study application"}
                </CardTitle>
                <Badge variant="secondary">
                  {STATUS_LABEL[lead.status] ?? lead.status}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Applied {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
