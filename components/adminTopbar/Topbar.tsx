"use client";

import TopbarIcons from "@/components/adminTopbar/TopbarIcons";
import { cn } from "@/lib/utils";
import { useStore } from "@/store/store";
import { TAdmin } from "@/types/admin.type";
import { Store } from "lucide-react";

type Props = {
  admin?: TAdmin;
  /** Desktop only: mirrors the sidebar state so the fixed bar starts exactly at the sidebar's edge. */
  sidebarOpen?: boolean;
  /** @deprecated no longer used, the bar follows `sidebarOpen` */
  sidebarWidth?: number;
};

export default function Topbar({ admin, sidebarOpen = true }: Props) {
  const vendorName = useStore((s) => s.vendor);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-1000 h-16 bg-white/70 backdrop-blur-lg border-b border-pink-100",
          sidebarOpen ? "md:left-60 lg:left-[20%]" : "md:left-20"
        )}
      >
        <div className="flex items-center justify-between gap-3 h-full px-3 sm:px-4 md:px-6">
          {/* LEFT: vendor pill (flexes + truncates instead of pushing the icons) */}
          <div className="flex-1 min-w-0 flex items-center">
            {vendorName && (
              <span
                title={vendorName}
                className="inline-flex max-w-full sm:max-w-xs items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-sm font-medium text-[#DC3173]"
              >
                <Store size={15} className="shrink-0" />
                <span className="truncate">{vendorName}</span>
              </span>
            )}
          </div>

          {/* RIGHT ICONS */}
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 shrink-0 relative z-1001">
            <TopbarIcons admin={admin} />
          </div>
        </div>
      </header>

      {/* Spacer (same height as the bar) */}
      <div className="h-16" />
    </>
  );
}