import { createServiceRoleClient } from "@/lib/supabase/service-role";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FlyerCodeForm } from "./flyer-code-form";
import { FlyerCodeRow } from "./flyer-code-row";

export default async function ScansPage() {
  const db = createServiceRoleClient();
  const [{ data: flyerCodes }, { data: scans }] = await Promise.all([
    db.from("flyer_codes").select("*").order("created_at", { ascending: false }),
    db
      .from("scans")
      .select("id, code, borough, scanned_at, converted")
      .order("scanned_at", { ascending: false })
      .limit(100),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dabira.org";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold">Flyer scans</h1>
        <p className="text-sm text-muted-foreground">
          Each code below gets its own QR code, redirecting to /apply with the
          borough tracked automatically.
        </p>
      </div>

      <FlyerCodeForm />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Borough</TableHead>
            <TableHead>Campaign</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(flyerCodes ?? []).map((fc) => (
            <FlyerCodeRow
              key={fc.code}
              code={fc.code}
              borough={fc.borough}
              campaignLabel={fc.campaign_label}
              isActive={fc.is_active}
              scanUrl={`${siteUrl}/api/scan/${fc.code}`}
            />
          ))}
          {(!flyerCodes || flyerCodes.length === 0) && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                No flyer codes yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent scans</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Borough</TableHead>
              <TableHead>Scanned</TableHead>
              <TableHead>Converted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(scans ?? []).map((scan) => (
              <TableRow key={scan.id}>
                <TableCell className="font-mono text-sm">{scan.code ?? "—"}</TableCell>
                <TableCell className="capitalize">{scan.borough.replace(/_/g, " ")}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(scan.scanned_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant={scan.converted ? "secondary" : "outline"}>
                    {scan.converted ? "Yes" : "No"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {(!scans || scans.length === 0) && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                  No scans yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
