"use client";

import Sidebar from "@/components/adminDashboardSidebar/adminDashboardSidebar";
import Topbar from "@/components/adminTopbar/Topbar";
import { cn } from "@/lib/utils";
import { TAdmin } from "@/types/admin.type";
import React, { useState } from "react";

export default function DesktopSidebar({
  children,
  adminData,
}: {
  children: React.ReactNode;
  adminData: TAdmin;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="hidden md:flex w-full">
      {/* Sidebar fixed left */}
      <div
        className={cn(
          "h-screen fixed top-0 left-0 z-50 bg-white border-r",
          open ? "w-[280px]" : "w-20",
        )}
      >
        <Sidebar open={open} setOpen={setOpen} admin={adminData} />
      </div>

      {/* Content area */}
      <div
        className={cn(
          "flex-1 flex flex-col",
          open ? "md:ml-[280px]" : "md:ml-20",
        )}
      >
        {/* Topbar sticky */}
        <div className="w-full sticky top-0 z-40">
          <Topbar admin={adminData} />
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
