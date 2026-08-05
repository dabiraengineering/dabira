import { notFound } from "next/navigation";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export default async function LegalPage({
  params,
}: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const db = createServiceRoleClient();
  const { data: section } = await db
    .from("page_sections")
    .select("title, body")
    .eq("section_key", slug)
    .single();

  if (!section) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="font-heading text-3xl font-medium">{section.title}</h1>
      <div className="mt-6 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
        {section.body}
      </div>
    </div>
  );
}
