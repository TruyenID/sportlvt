"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GeneralPanel } from "./general-panel";
import { BannersPanel } from "./banners-panel";
import { HeroSlidesPanel } from "./hero-slides-panel";
import { PagesPanel } from "./pages-panel";

const TABS = [
  { key: "general", label: "Thông tin & Logo" },
  { key: "hero", label: "Banner đầu trang" },
  { key: "banners", label: "Banner" },
  { key: "pages", label: "Trang động" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Cài đặt website</h1>
        <p className="text-sm text-muted-foreground">
          Chỉnh sửa thông tin chung, banner trang chủ và các trang nội dung tĩnh.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" && <GeneralPanel />}
      {tab === "hero" && <HeroSlidesPanel />}
      {tab === "banners" && <BannersPanel />}
      {tab === "pages" && <PagesPanel />}
    </div>
  );
}
