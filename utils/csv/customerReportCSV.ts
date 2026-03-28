import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateCustomerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    totalCustomers: number;
    activeCustomers: number;
    totalOrders: number;
    totalRevenue: string;
  };
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Customers", String(stats.totalCustomers)]);
  rows.push(["Active Customers", String(stats.activeCustomers)]);
  rows.push(["Total Orders", String(stats.totalOrders)]);
  rows.push([
    "Total Revenue",
    String(
      `€${formatPrice(Number(stats.totalRevenue?.replace("€", "")) || 0)}`,
    ),
  ]);
  rows.push([]); // spacer row

  // ===== SECTION 2: STATUS DISTRIBUTION =====
  rows.push(["--- STATUS DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(statusDistribution).forEach(([status, count]) => {
    rows.push([status.replace(/_/g, " ").toUpperCase(), count]);
  });

  rows.push([]);

  // ===== SECTION 3: MONTHLY SIGNUPS =====
  rows.push(["--- MONTHLY SIGNUPS ---"]);
  rows.push(["Month", "Customers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.label, String(item.value)]);
  });
  rows.push([]);

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
