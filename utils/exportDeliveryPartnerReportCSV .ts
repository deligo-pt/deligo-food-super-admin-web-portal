import { TDeliveryPartner } from "@/types/delivery-partner.type";
import { format } from "date-fns";

export function exportDeliveryPartnerReportCSV({
  vehicleDistribution,
  monthlySignups,
  stats,
  deliveryPartners,
}: {
  vehicleDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    total: number;
    approved: number;
    totalDeliveries: number;
    totalEarnings: number;
  };
  deliveryPartners: TDeliveryPartner[];
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Delivery Partners", String(stats.total)]);
  rows.push(["Approved Delivery Partners", String(stats.approved)]);
  rows.push(["Total Deliveries", String(stats.totalDeliveries)]);
  rows.push(["Total Earnings", String(stats.totalEarnings)]);
  rows.push([]);

  // ===== SECTION 2: VEHICLE TYPE DISTRIBUTION =====
  rows.push(["--- VEHICLE TYPE DISTRIBUTION ---"]);
  rows.push(["Status", "Count"]);

  Object.entries(vehicleDistribution).forEach(([status, count]) => {
    rows.push([
      status.replace(/_/g, " ").toUpperCase(), // optional formatting
      count,
    ]);
  });

  rows.push([]);

  // ===== SECTION 3: MONTHLY SIGNUPS =====
  rows.push(["--- MONTHLY SIGNUPS ---"]);
  rows.push(["Month", "Customers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.label, String(item.value)]);
  });
  rows.push([]);

  // ===== SECTION 4: DELIVERY PARTNERS TABLE =====
  rows.push(["--- DELIVERY PARTNERS ---"]);
  rows.push([
    "Delivery Partner ID",
    "Name",
    "Email",
    "Phone",
    "Profile Photo",
    "Vehicle",
    "Deliveries",
    "Rating",
    "Earnings",
    "Joined Date",
    "Status",
  ]);

  deliveryPartners.forEach((dp) => {
    rows.push([
      dp.userId,
      dp.name?.firstName && dp.name?.lastName
        ? `${dp.name?.firstName} ${dp.name?.lastName}`
        : "N/A",
      dp.email || "N/A",
      dp.contactNumber || "N/A",
      dp.profilePhoto || "N/A",
      dp.vehicleInfo?.vehicleType || "N/A",
      dp.operationalData?.completedDeliveries || 0,
      dp.operationalData?.rating?.average || 0,
      dp.earnings?.totalEarnings || 0,
      format(dp.createdAt as Date, "yyyy-MM-dd"),
      dp.status,
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
  a.download = `delivery_partner_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
