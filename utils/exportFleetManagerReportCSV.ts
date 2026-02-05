import { TAgent } from "@/types/user.type";
import { format } from "date-fns";

export function exportFleetManagerReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
  fleetManagers,
}: {
  statusDistribution: { name: string; value: number }[];
  monthlySignups: { name: string; managers: number }[];
  stats: {
    total: number;
    approved: number;
    totalDrivers: number;
    totalDeliveries: number;
  };
  fleetManagers: TAgent[];
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Vendors", String(stats.total)]);
  rows.push(["Approved Vendors", String(stats.approved)]);
  rows.push(["Submitted Vendors", String(stats.totalDrivers)]);
  rows.push(["Total Deliveries", String(stats.totalDeliveries)]);
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
    rows.push([item.name, String(item.managers)]);
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
