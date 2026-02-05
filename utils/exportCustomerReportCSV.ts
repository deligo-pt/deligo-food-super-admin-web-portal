import { TCustomer } from "@/types/user.type";
import { format } from "date-fns";

export function exportCustomerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
  customer,
}: {
  statusDistribution: { name: string; value: number }[];
  monthlySignups: { name: string; customers: number }[];
  stats: {
    total: number;
    active: number;
    totalOrders: number;
    totalSpent: number;
  };
  customer: TCustomer[];
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Customers", String(stats.total)]);
  rows.push(["Active Customers", String(stats.active)]);
  rows.push(["Total Orders", String(stats.totalOrders)]);
  rows.push(["Total Revenue", String(stats.totalSpent)]);
  rows.push([]); // spacer row

  // ===== SECTION 2: STATUS DISTRIBUTION =====
  rows.push(["--- STATUS DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);
  statusDistribution.forEach((item) => {
    rows.push([item.name, String(item.value)]);
  });
  rows.push([]);

  // ===== SECTION 3: MONTHLY SIGNUPS =====
  rows.push(["--- MONTHLY SIGNUPS ---"]);
  rows.push(["Month", "Customers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.name, String(item.customers)]);
  });
  rows.push([]);

  // ===== SECTION 4: USERS TABLE =====
  rows.push(["--- USERS ---"]);
  rows.push([
    "User ID",
    "Name",
    "Email",
    "Profile Photo",
    "Orders",
    "Total Spent",
    "Points",
    "Last Ordered Date",
    "Joined Date",
    "Status",
  ]);

  customer.forEach((u) => {
    rows.push([
      u.userId,
      u.name?.firstName && u.name?.lastName
        ? `${u.name?.firstName} ${u.name?.lastName}`
        : "N/A",
      u.email || "N/A",
      u.profilePhoto || "N/A",
      u.orders?.totalOrders || 0,
      u.orders?.totalSpent || 0,
      u.loyaltyPoints || 0,
      u.orders?.lastOrderDate
        ? format(u.orders?.lastOrderDate, "yyyy-MM-dd")
        : "N/A",
      format(u.createdAt as Date, "yyyy-MM-dd"),
      u.status,
    ]);
  });

  // ===== BUILD CSV =====
  const csv = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `customer_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
