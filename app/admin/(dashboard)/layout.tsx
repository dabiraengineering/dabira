import Link from "next/link";
import {
  Users,
  QrCode,
  Layers,
  FileText,
  Settings,
  UserCog,
  Image as ImageIcon,
  LogOut,
} from "lucide-react";
import { requireStaffAuth } from "@/lib/dal";
import { signOut } from "@/lib/actions/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/scans", label: "Scans", icon: QrCode },
  { href: "/admin/cohorts", label: "Cohorts", icon: Layers },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
];

export default async function DashboardLayout({
  children,
}: LayoutProps<"/admin">) {
  const staff = await requireStaffAuth();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="px-4 py-3">
          <span className="font-semibold">Dabira Admin</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="gap-2 px-4 py-3">
          <p className="truncate text-sm text-muted-foreground">
            {staff.fullName ?? "Staff"} &middot; {staff.role}
          </p>
          <form action={signOut}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start px-0"
            >
              <LogOut /> Sign out
            </Button>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
