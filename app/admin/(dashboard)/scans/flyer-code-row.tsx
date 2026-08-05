"use client";

import { useTransition } from "react";
import { toggleFlyerCodeActive, deleteFlyerCode } from "@/lib/actions/scans-admin";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Copy, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function FlyerCodeRow({
  code,
  borough,
  campaignLabel,
  isActive,
  scanUrl,
}: {
  code: string;
  borough: string;
  campaignLabel: string | null;
  isActive: boolean;
  scanUrl: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{code}</TableCell>
      <TableCell className="capitalize">{borough.replace(/_/g, " ")}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{campaignLabel ?? "—"}</TableCell>
      <TableCell>
        <Switch
          checked={isActive}
          disabled={isPending}
          onCheckedChange={(checked) =>
            startTransition(() => toggleFlyerCodeActive(code, checked))
          }
        />
      </TableCell>
      <TableCell className="text-right">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(scanUrl);
            toast.success("Scan URL copied");
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => {
            if (confirm(`Delete flyer code "${code}"?`)) {
              startTransition(() => deleteFlyerCode(code));
            }
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
