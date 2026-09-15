"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  Package,
  FolderTree,
  Tags,
  Dumbbell,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Tổng quan", url: "/", icon: LayoutDashboard },
  { title: "Sản phẩm", url: "/products", icon: Package },
  { title: "Danh mục", url: "/categories", icon: FolderTree },
  { title: "Thương hiệu", url: "/brands", icon: Tags },
  { title: "Khách hàng", url: "/users", icon: Users },
  { title: "Cài đặt", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Dumbbell className="size-4.5" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-semibold text-sm">LevanTruyen</span>
            <span className="text-xs text-sidebar-foreground/60">Sports Admin</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={pathname === item.url}
                    className="gap-2.5 data-[active=true]:font-medium"
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1.5 text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} LevanTruyen
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
