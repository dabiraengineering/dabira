import Link from "next/link";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CohortRowActions } from "./cohort-row-actions";

export default async function CohortsPage() {
  const db = createServiceRoleClient();
  const { data: cohorts } = await db
    .from("cohorts")
    .select("*")
    .order("starts_on", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cohorts</h1>
        <Button render={<Link href="/admin/cohorts/new" />} nativeButton={false}>
          New cohort
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Study</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Compensation</TableHead>
            <TableHead>Starts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(cohorts ?? []).map((cohort) => (
            <TableRow key={cohort.id}>
              <TableCell className="max-w-40 truncate font-medium">
                {cohort.study_title}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {cohort.is_current && <Badge>Current</Badge>}
                  {cohort.is_waitlist && (
                    <Badge variant="secondary">Waitlist</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap">${cohort.compensation_usd}</TableCell>
              <TableCell className="whitespace-nowrap">{cohort.starts_on}</TableCell>
              <TableCell className="text-right">
                <CohortRowActions
                  id={cohort.id}
                  isCurrent={cohort.is_current}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
