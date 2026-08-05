import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getMediaOptions } from "@/lib/media";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { SectionEditor } from "./section-editor";
import { FaqEditor } from "./faq-editor";
import { StepsEditor } from "./steps-editor";
import { StatsEditor } from "./stats-editor";

export default async function ContentPage() {
  const db = createServiceRoleClient();
  const [{ data: sections }, { data: faqs }, { data: steps }, { data: stats }, media] =
    await Promise.all([
      db.from("page_sections").select("*"),
      db.from("faq_items").select("*").order("position"),
      db.from("how_it_works_steps").select("*").order("position"),
      db.from("stat_items").select("*").order("position"),
      getMediaOptions(),
    ]);

  const sectionMap = new Map((sections ?? []).map((s) => [s.section_key, s]));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Content</h1>

      <Tabs defaultValue="sections">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="steps">How it works</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="flex flex-col gap-4">
          {(["hero", "about"] as const).map((key) => {
            const s = sectionMap.get(key);
            return (
              <SectionEditor
                key={key}
                sectionKey={key}
                label={key === "hero" ? "Hero" : "About"}
                title={s?.title ?? null}
                body={s?.body ?? null}
                imageId={s?.image_id ?? null}
                isVisible={s?.is_visible ?? true}
                media={media}
              />
            );
          })}
        </TabsContent>

        <TabsContent value="stats">
          <StatsEditor items={stats ?? []} />
        </TabsContent>

        <TabsContent value="steps">
          <StepsEditor items={steps ?? []} />
        </TabsContent>

        <TabsContent value="faq">
          <FaqEditor items={faqs ?? []} />
        </TabsContent>

        <TabsContent value="legal" className="flex flex-col gap-4">
          {(["privacy-policy", "terms", "footer"] as const).map((key) => {
            const s = sectionMap.get(key);
            return (
              <SectionEditor
                key={key}
                sectionKey={key}
                label={
                  key === "privacy-policy"
                    ? "Privacy Policy"
                    : key === "terms"
                      ? "Terms & Conditions"
                      : "Footer"
                }
                title={s?.title ?? null}
                body={s?.body ?? null}
                imageId={s?.image_id ?? null}
                isVisible={s?.is_visible ?? true}
                media={media}
                showImage={false}
              />
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
