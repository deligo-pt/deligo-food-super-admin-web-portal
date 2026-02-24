import { TVendor } from "@/types/user.type";
import { format } from "date-fns";

export function exportVendorReportCSV({
  statusDistribution,
  monthlySignups,
  stats,
  vendors,
}: {
  statusDistribution: Record<string, number>;
  monthlySignups: { label: string; value: number }[];
  stats: {
    total: number;
    approved: number;
    pending: number;
    blocked: number;
  };
  vendors: TVendor[];
}) {
  const rows: (string | number | undefined | null)[][] = [];

  // ===== SECTION 1: SUMMARY STATS =====
  rows.push(["--- SUMMARY STATS ---"]);
  rows.push(["Total Vendors", String(stats.total)]);
  rows.push(["Approved Vendors", String(stats.approved)]);
  rows.push(["Submitted Vendors", String(stats.pending)]);
  rows.push(["Blocked/Rejected Vendors", String(stats.blocked)]);
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
  rows.push(["Month", "Customers"]);
  monthlySignups.forEach((item) => {
    rows.push([item.label, String(item.value)]);
  });
  rows.push([]);

  // ===== SECTION 4: VENDORS TABLE =====
  rows.push(["--- VENDORS ---"]);
  rows.push([
    "Vendor ID",
    "Business Name",
    "Business Type",
    "Owner",
    "Email",
    "Vendor Photo",
    "Orders",
    "Rating",
    "Joined Date",
    "Status",
  ]);

  vendors.forEach((v) => {
    rows.push([
      v.userId,
      v.businessDetails?.businessName || "N/A",
      v.businessDetails?.businessType || "N/A",
      v.name?.firstName && v.name?.lastName
        ? `${v.name?.firstName} ${v.name?.lastName}`
        : "N/A",
      v.email || "N/A",
      v.profilePhoto || "N/A",
      v.totalOrders || 0,
      v.rating?.average || 0,
      format(v.createdAt as Date, "yyyy-MM-dd"),
      v.status,
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
  a.download = `vendor_report_${format(new Date(), "yyyy-MM-dd_hh_mm_ss_a")}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
