import { createCohort } from "@/lib/actions/cohorts";
import { getMediaOptions } from "@/lib/media";
import { CohortForm } from "../cohort-form";

export default async function NewCohortPage() {
  const media = await getMediaOptions();
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New cohort</h1>
      <CohortForm action={createCohort} media={media} />
    </div>
  );
}
