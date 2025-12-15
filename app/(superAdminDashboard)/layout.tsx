export const dynamic = "force-dynamic";

import Sidebar from "@/components/adminDashboardSidebar/adminDashboardSidebar";
import Topbar from "@/components/adminTopbar/Topbar";
import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Deligo admin dashboard",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let adminData: TAdmin = {} as TAdmin;

  try {
    const result = await serverRequest.get("/profile");

    if (result?.success) {
      adminData = result?.data;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile view: Sidebar on top, Topbar below */}
      <div className="flex flex-col md:hidden w-full">
        <div className="w-full">
          <Sidebar />
        </div>
        <div className="w-full sticky top-0 z-40">
          <Topbar />
        </div>
        <main className="flex-1 p-4 overflow-y-auto">{children}</main>
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex w-full overflow-x-hidden">
        {/* Sidebar fixed left */}
        <div className="w-[280px] h-screen fixed top-0 left-0 z-50 bg-white border-r">
          <Sidebar />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col md:ml-[280px] overflow-x-hidden max-w-full">
          {/* Topbar sticky */}
          <div className="w-full sticky top-0 z-40">
            <Topbar admin={adminData} />
          </div>
          {/* Page content */}
          <main className="flex-1 p-4 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
