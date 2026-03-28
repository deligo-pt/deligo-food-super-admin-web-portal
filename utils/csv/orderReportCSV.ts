import { IOrderReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateOrderReportCSV(data: IOrderReportAnalytics) {
  const rows: (string | number)[][] = [];

  /* ===== SECTION 1: SUMMARY ===== */
  rows.push(["--- ORDER SUMMARY ---"]);
  rows.push(["Total Orders", data.summary.totalOrders]);
  rows.push(["Total Revenue", formatPrice(data.summary.totalRevenue)]);
  rows.push(["Average Order Value", formatPrice(data.summary.avgOrderValue)]);
  rows.push([]);

  /* ===== SECTION 2: ORDERS TREND ===== */
  rows.push(["--- ORDERS TREND ---"]);
  rows.push(["Date", "Orders"]);

  data.ordersTrend.forEach((item) => {
    rows.push([item.date, item.orders]);
  });

  rows.push([]);

  /* ===== SECTION 3: REVENUE TREND ===== */
  rows.push(["--- REVENUE TREND ---"]);
  rows.push(["Date", "Revenue"]);

  data.revenueTrend.forEach((item) => {
    rows.push([item.date, item.revenue]);
  });

  rows.push([]);

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
  a.download = `order_report_${format(
    new Date(),
    "yyyy-MM-dd_hh_mm_ss_a",
  )}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}
