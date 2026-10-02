"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/components/providers";
import { logout } from "@/lib/endpoints";

const pageTitles: Record<string, string> = {
  "/": "Tổng quan",
  "/products": "Quản lý sản phẩm",
  "/categories": "Danh mục",
  "/brands": "Thương hiệu",
  "/contacts": "Liên hệ",
  "/users": "Khách hàng",
  "/settings": "Cài đặt",
};

function resolveTitle(pathname: string) {
  if (pageTitles[pathname]) return pageTitles[pathname];
  const base = "/" + pathname.split("/")[1];
  if (pageTitles[base]) {
    return pathname.endsWith("/new")
      ? `${pageTitles[base]} · Thêm mới`
      : `${pageTitles[base]} · Chỉnh sửa`;
  }
  return "Admin";
}

export function SiteHeader() {
  const { user, clearSession } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    router.replace("/login");
  }

  const initials = user?.name?.slice(0, 2).toUpperCase() ?? "AD";

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b bg-card/60 px-4 backdrop-blur-sm">
      <SidebarTrigger />
      <Separator orientation="vertical" className="h-4" />
      <div className="flex-1 text-sm font-semibold">{resolveTitle(pathname)}</div>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user?.name ?? "Admin"}
          </span>
          <Avatar className="size-8 ring-2 ring-primary/20">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive">
            <LogOut className="size-4" /> Đăng xuất
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
