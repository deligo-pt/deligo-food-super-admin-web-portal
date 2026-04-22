import { IDeliveryPartnerReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateDeliveryPartnerReportCSV(
  reportData: IDeliveryPartnerReportAnalytics,
) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push([
    "Total Delivery Partners",
    String(reportData.stats?.totalPartners),
  ]);
  rows.push([
    "Approved Delivery Partners",
    String(reportData.stats?.approvedPartners),
  ]);
  rows.push(["Total Deliveries", String(reportData.stats?.totalDeliveries)]);
  rows.push([
    "Total Earnings",
    String(`€${formatPrice(reportData.stats?.totalEarnings || 0)}`),
  ]);

  rows.push([]);

  // ===== SECTION 2: VEHICLE TYPE DISTRIBUTION =====
  rows.push(["--- VEHICLE TYPE DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(reportData.vehicleDistribution).forEach(([status, count]) => {
    rows.push([status.replace(/_/g, " ").toUpperCase(), count]);
  });

  rows.push([]);

  // ===== SECTION 3: PARTNER GROWTH =====
  rows.push(["--- PARTNER GROWTH ---"]);
  rows.push(["Time", "Partners"]);
  reportData.partnerGrowths?.forEach((item) => {
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
  a.download = `delivery_partner_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
