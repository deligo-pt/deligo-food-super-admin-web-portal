import { ICustomerReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateCustomerReportCSV(
  reportData: ICustomerReportAnalytics,
) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Customers", String(reportData.stats?.totalCustomers)]);
  rows.push(["Active Customers", String(reportData.stats?.activeCustomers)]);
  rows.push(["Total Orders", String(reportData.stats?.totalOrders)]);
  rows.push([
    "Total Revenue",
    String(`€${formatPrice(reportData.stats?.totalSpent || 0)}`),
  ]);

  rows.push([]);

  // ===== SECTION 2: STATUS DISTRIBUTION =====
  rows.push(["--- STATUS DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);
  rows.push(["ACTIVE", reportData.statusDistribution?.active]);
  rows.push(["BLOCKED", reportData.statusDistribution?.blocked]);

  rows.push([]);

  // ===== SECTION 3: CUSTOMER GROWTH =====
  rows.push(["--- CUSTOMER GROWTH ---"]);
  rows.push(["Time", "Customers"]);
  reportData.customerGrowth.forEach((item) => {
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
