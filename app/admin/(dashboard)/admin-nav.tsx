"use client";

import Link from "next/link";
import {
  Users,
  QrCode,
  Layers,
  FileText,
  Settings,
  UserCog,
  Image as ImageIcon,
} from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/scans", label: "Scans", icon: QrCode },
  { href: "/admin/cohorts", label: "Cohorts", icon: Layers },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/staff", label: "Staff", icon: UserCog },
];

export function AdminNav() {
  // Client-side navigation doesn't remount the mobile sidebar overlay,
  // so it stays open after tapping a link unless closed explicitly.
  const { isMobile, setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            render={<Link href={item.href} />}
            onClick={() => {
              if (isMobile) setOpenMobile(false);
            }}
          >
            <item.icon />
            <span>{item.label}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
