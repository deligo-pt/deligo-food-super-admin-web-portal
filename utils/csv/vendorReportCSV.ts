import { format } from "date-fns";

export function generateVendorReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    totalVendors: number;
    approvedVendors: number;
    submittedVendors: number;
    blockedOrRejectedVendors: number;
  };
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Vendors", String(stats.totalVendors)]);
  rows.push(["Approved Vendors", String(stats.approvedVendors)]);
  rows.push(["Submitted Vendors", String(stats.submittedVendors)]);
  rows.push([
    "Blocked/Rejected Vendors",
    String(stats.blockedOrRejectedVendors),
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
  a.download = `vendor_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
