import { IFleetManagerReportAnalytics } from "@/types/report.type";
import { format } from "date-fns";

export function generateFleetManagerReportCSV(
  reportData: IFleetManagerReportAnalytics,
) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Managers", String(reportData.stats?.totalManagers)]);
  rows.push(["Approved Managers", String(reportData.stats?.approvedManagers)]);
  rows.push(["Total Drivers", String(reportData.stats?.totalDrivers)]);
  rows.push(["Total Deliveries", String(reportData.stats?.totalDeliveries)]);

  rows.push([]);

  // ===== SECTION 2: STATUS DISTRIBUTION =====
  rows.push(["--- STATUS DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(reportData.statusDistribution).forEach(([status, count]) => {
    rows.push([status.replace(/_/g, " ").toUpperCase(), count]);
  });

  rows.push([]);

  // ===== SECTION 3: FLEET MANAGER GROWTH =====
  rows.push(["--- FLEET MANAGER GROWTH ---"]);
  rows.push(["Time", "Managers"]);
  reportData.fleetGrowths?.forEach((item) => {
    rows.push([item.time, String(item.managers)]);
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
