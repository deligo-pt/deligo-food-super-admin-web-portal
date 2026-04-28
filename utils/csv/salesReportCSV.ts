import { ISalesReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateSalesReportCSV(data: ISalesReportAnalytics) {
  const rows: (string | number)[][] = [];

  /* ===== SECTION 1: SUMMARY ===== */
  rows.push(["--- SALES SUMMARY ---"]);
  rows.push(["Total Revenue", formatPrice(data.stats?.totalRevenue)]);
  rows.push(["Completed Orders", data.stats?.completedOrders]);
  rows.push(["Cancelled Orders", data.stats?.cancelledOrders]);
  rows.push(["Average Order Value", formatPrice(data.stats?.avgOrderValue)]);
  rows.push([]);

  /* ===== SECTION 2: REVENUE TREND ===== */
  rows.push(["--- REVENUE TREND ---"]);
  rows.push(["Time", "Revenue"]);

  data.revenueTrend?.forEach((item) => {
    rows.push([item.time, formatPrice(item.revenue)]);
  });

  /* ===== BUILD CSV ===== */
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `sales_report_${format(
    new Date(),
    "yyyy-MM-dd_hh_mm_ss_a",
  )}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
