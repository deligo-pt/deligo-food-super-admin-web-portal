import { IOrderReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

export function generateOrderReportCSV(data: IOrderReportAnalytics) {
  const rows: (string | number)[][] = [];

  /* ===== SECTION 1: SUMMARY ===== */
  rows.push(["--- ORDER SUMMARY ---"]);
  rows.push(["Total Orders", data.stats?.totalOrders]);
  rows.push(["Total Revenue", formatPrice(data.stats?.totalRevenue)]);
  rows.push(["Average Order Value", formatPrice(data.stats?.avgOrderValue)]);
  rows.push([]);

  /* ===== SECTION 2: ORDERS TREND ===== */
  rows.push(["--- ORDERS TREND ---"]);
  rows.push(["Time", "Orders"]);

  data.ordersTrend?.forEach((item) => {
    rows.push([item.time, item.orders]);
  });

  rows.push([]);

  /* ===== SECTION 3: ORDERS BY ZONE ===== */
  rows.push(["--- ORDERS BY ZONE ---"]);
  rows.push(["Zone", "Orders"]);

  data.ordersByZone?.forEach((item) => {
    rows.push([item.label, item.value]);
  });

  rows.push([]);

  /* ===== SECTION 4: Zone Heat Map ===== */
  rows.push(["--- Zone Heat Map ---"]);
  rows.push(["Zone", "Hour", "Orders"]);

  data.zoneHeatmap?.forEach((item) => {
    rows.push([item.zone, item.hour, item.orderCount]);
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
