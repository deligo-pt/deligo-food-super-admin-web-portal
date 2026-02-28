import { TAgent } from "@/types/user.type";
import { format } from "date-fns";

export function exportFleetManagerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
  fleetManagers,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    total: number;
    approved: number;
    submitted: number;
    blocked_rejected: number;
  };
  fleetManagers: TAgent[];
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Managers", String(stats.total)]);
  rows.push(["Approved Managers", String(stats.approved)]);
  rows.push(["Submitted Managers", String(stats.submitted)]);
  rows.push(["Blocked/Rejected Managers", String(stats.blocked_rejected)]);
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
  rows.push(["Month", "Managers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.label, String(item.value)]);
  });
  rows.push([]);

  // ===== SECTION 4: FLEET MANAGERS TABLE =====
  rows.push(["--- FLEET MANAGERS ---"]);
  rows.push([
    "Fleet Manager ID",
    "Name",
    "Email",
    "Fleet Manager Photo",
    "Drivers",
    "Deliveries",
    "Rating",
    "Joined Date",
    "Status",
  ]);

  fleetManagers.forEach((fm) => {
    rows.push([
      fm.userId,
      fm.name?.firstName && fm.name?.lastName
        ? `${fm.name?.firstName} ${fm.name?.lastName}`
        : "N/A",
      fm.email || "N/A",
      fm.profilePhoto || "N/A",
      fm.operationalData?.totalDrivers || 0,
      fm.operationalData?.totalDeliveries || 0,
      fm.operationalData?.rating?.average || 0,
      format(fm.createdAt as Date, "yyyy-MM-dd"),
      fm.status,
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
  a.download = `fleet_manager_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
