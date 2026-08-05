import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getMediaOptions } from "@/lib/media";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SiteSettingsForm } from "./site-settings-form";
import { SocialLinksEditor } from "./social-links-editor";

export default async function SettingsPage() {
  const db = createServiceRoleClient();
  const [{ data: settings }, { data: socials }, media] = await Promise.all([
    db.from("site_settings").select("*").single(),
    db.from("social_links").select("*").order("position"),
    getMediaOptions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Site</CardTitle>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm settings={settings} media={media} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Social links</CardTitle>
        </CardHeader>
        <CardContent>
          <SocialLinksEditor items={socials ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
