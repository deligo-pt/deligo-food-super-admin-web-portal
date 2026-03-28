import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateDeliveryPartnerReportCSV({
  vehicleDistribution,
  monthlySignups,
  stats,
}: {
  vehicleDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    totalPartners: number;
    activePartners: number;
    totalDeliveries: number;
    totalEarnings: string;
  };
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Delivery Partners", String(stats.totalPartners)]);
  rows.push(["Approved Delivery Partners", String(stats.activePartners)]);
  rows.push(["Total Deliveries", String(stats.totalDeliveries)]);
  rows.push([
    "Total Earnings",
    String(
      `€${formatPrice(Number(stats.totalEarnings?.replace("€", "")) || 0)}`,
    ),
  ]);
  rows.push([]);

  // ===== SECTION 2: VEHICLE TYPE DISTRIBUTION =====
  rows.push(["--- VEHICLE TYPE DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(vehicleDistribution).forEach(([status, count]) => {
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
  a.download = `delivery_partner_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
