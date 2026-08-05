import { createCohort } from "@/lib/actions/cohorts";
import { CohortForm } from "../cohort-form";

export default function NewCohortPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New cohort</h1>
      <CohortForm action={createCohort} />
    </div>
  );
}
