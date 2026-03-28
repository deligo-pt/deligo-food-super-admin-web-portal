import { format } from "date-fns";

export function generateFleetManagerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    totalFleetManagers: number;
    approvedFleetManagers: number;
    submittedFleetManagers: number;
    blockedOrRejectedFleetManagers: number;
  };
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Managers", String(stats.totalFleetManagers)]);
  rows.push(["Approved Managers", String(stats.approvedFleetManagers)]);
  rows.push(["Submitted Managers", String(stats.submittedFleetManagers)]);
  rows.push([
    "Blocked/Rejected Managers",
    String(stats.blockedOrRejectedFleetManagers),
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
  rows.push(["Month", "Managers"]);
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
  a.download = `fleet_manager_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
