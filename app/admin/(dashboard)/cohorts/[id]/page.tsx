import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { updateCohort } from "@/lib/actions/cohorts";
import { CohortForm } from "../cohort-form";

export default async function EditCohortPage({
  params,
}: PageProps<"/admin/cohorts/[id]">) {
  const { id } = await params;
  const db = createServiceRoleClient();
  const { data: cohort } = await db
    .from("cohorts")
    .select("*")
    .eq("id", id)
    .single();

  if (!cohort) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Edit cohort</h1>
      <CohortForm cohort={cohort} action={updateCohort.bind(null, id)} />
    </div>
  );
}
