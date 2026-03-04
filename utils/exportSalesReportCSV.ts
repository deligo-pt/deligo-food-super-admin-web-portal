import { ISalesReportAnalytics } from "@/types/report.type";
import { format } from "date-fns";

export function exportSalesReportCSV(data: ISalesReportAnalytics) {
    const rows: (string | number)[][] = [];

    /* ===== SECTION 1: SUMMARY ===== */
    rows.push(["--- SALES SUMMARY ---"]);
    rows.push(["Total Revenue", data.summary.totalRevenue]);
    rows.push(["Completed Orders", data.summary.completedOrders]);
    rows.push(["Cancelled Orders", data.summary.cancelledOrders]);
    rows.push(["Average Order Value", data.summary.avgOrderValue]);
    rows.push([]);

    /* ===== SECTION 2: REVENUE CARDS ===== */
    rows.push(["--- REVENUE HIGHLIGHTS ---"]);
    rows.push(["This Week Revenue", data.revenueCards.thisWeek]);
    rows.push(["This Month Revenue", data.revenueCards.thisMonth]);
    rows.push(["Top Earning Day", data.revenueCards.topEarningDay]);
    rows.push([]);

    /* ===== SECTION 3: EARNINGS BY DAY ===== */
    rows.push(["--- EARNINGS BY DAY ---"]);
    rows.push(["Date", "Revenue"]);

    data.charts.earningsByDay.forEach((item) => {
        rows.push([item.date, item.revenue]);
    });

    rows.push([]);

    /* ===== SECTION 4: REVENUE TREND ===== */
    rows.push(["--- REVENUE TREND ---"]);
    rows.push(["Date", "Revenue"]);

    data.charts.revenueTrend.forEach((item) => {
        rows.push([item.date, item.revenue]);
    });

    /* ===== BUILD CSV ===== */
    const csv = rows
        .map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_report_${format(
        new Date(),
        "yyyy-MM-dd_hh_mm_ss_a"
    )}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}