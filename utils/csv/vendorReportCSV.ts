import { IVendorReportAnalytics } from "@/types/report.type";
import { format } from "date-fns";

export function generateVendorReportCSV(
  vendorReportData: IVendorReportAnalytics,
) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Vendors", String(vendorReportData.stats?.totalVendors)]);
  rows.push([
    "Approved Vendors",
    String(vendorReportData.stats?.approvedVendors),
  ]);
  rows.push([
    "Pending Vendors",
    String(vendorReportData.stats?.pendingVendors),
  ]);
  rows.push([
    "Blocked/Rejected Vendors",
    String(vendorReportData.stats?.blockedVendors),
  ]);

  rows.push([]);

  // ===== SECTION 2: STATUS DISTRIBUTION =====
  rows.push(["--- STATUS DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(vendorReportData.statusDistribution).forEach(
    ([status, count]) => {
      rows.push([status.replace(/_/g, " ").toUpperCase(), count]);
    },
  );

  rows.push([]);

  // ===== SECTION 3: VENDOR GROWTH =====
  rows.push(["--- VENDOR GROWTH ---"]);
  rows.push(["Time", "Vendors"]);
  vendorReportData.vendorGrowths?.forEach((item) => {
    rows.push([item.time, String(item.vendors)]);
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
  a.download = `vendor_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
