import { TCustomer } from "@/types/user.type";
import { format } from "date-fns";

export function exportCustomerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
  customers,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    total: number;
    active: number;
    totalOrders: number;
    totalSpent: number;
  };
  customers: TCustomer[];
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

  Object.entries(statusDistribution).forEach(([status, count]) => {
    rows.push([
      status.replace(/_/g, " ").toUpperCase(), // optional formatting
      count,
    ]);
  });

  rows.push([]);

  // ===== SECTION 3: MONTHLY SIGNUPS =====
  rows.push(["--- MONTHLY SIGNUPS ---"]);
  rows.push(["Month", "Customers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.label, String(item.value)]);
  });
  rows.push([]);

  // ===== SECTION 4: CUSTOMERS TABLE =====
  rows.push(["--- CUSTOMERS ---"]);
  rows.push([
    "Customer ID",
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

  customers.forEach((c) => {
    rows.push([
      c.userId,
      c.name?.firstName && c.name?.lastName
        ? `${c.name?.firstName} ${c.name?.lastName}`
        : "N/A",
      c.email || "N/A",
      c.profilePhoto || "N/A",
      c.orders?.totalOrders || 0,
      c.orders?.totalSpent || 0,
      c.loyaltyPoints || 0,
      c.orders?.lastOrderDate
        ? format(c.orders?.lastOrderDate, "yyyy-MM-dd")
        : "N/A",
      format(c.createdAt as Date, "yyyy-MM-dd"),
      c.status,
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
