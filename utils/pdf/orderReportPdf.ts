import { IOrderReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateOrderReportPDF = (
  orderReportData: IOrderReportAnalytics,
) => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;

  // header section
  const headerTop = 15;
  const logoSize = 18;

  doc.addImage(
    "/deligoLogo.png",
    "PNG",
    marginX,
    headerTop,
    logoSize,
    logoSize,
  );

  const textX = marginX + logoSize + 6;
  let currentY = headerTop + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("PIXELMIRACLE, LDA", textX, currentY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  currentY += 5;
  doc.text("Avenida do Brasil, nº 43, 6º D", textX, currentY);

  currentY += 4;
  doc.text("1700-062 Lisboa, Portugal", textX, currentY);

  currentY += 4;
  doc.text("NIF: 518758176", textX, currentY);

  currentY += 4;
  doc.text("Email: contact@deligo.pt", textX, currentY);

  currentY += 4;
  doc.setTextColor(220, 49, 115);
  doc.text("www.deligo.pt", textX, currentY);
  doc.setTextColor(0);

  // Right header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Admin Order Report", pageWidth - marginX, headerTop + 5, {
    align: "right",
  });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    `Generated: ${format(new Date(), "yyyy-MM-dd")}`,
    pageWidth - marginX,
    headerTop + 11,
    { align: "right" },
  );

  // Divider
  const dividerY = Math.max(headerTop + logoSize, currentY) + 8;
  doc.setDrawColor(220, 49, 115);
  doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

  // summary
  let y = dividerY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Order Summary", marginX, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Total Revenue: €${formatPrice(orderReportData.stats?.totalRevenue || 0)}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(
    `Completed Orders: ${orderReportData.stats?.totalOrders}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(
    `Average Order Value: €${formatPrice(orderReportData.stats?.avgOrderValue || 0)}`,
    marginX,
    y,
  );

  // Orders trend
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Orders Trend", marginX, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Time", "Orders"]],
    body: orderReportData.ordersTrend?.map((d) => [d.time, d.orders]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [220, 49, 115],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: marginX, right: marginX },
  });

  // Orders By Zone
  y += 20 + orderReportData.ordersTrend?.length * 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Orders By Zone", marginX, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Zone", "Orders"]],
    body: orderReportData.ordersByZone?.map((d) => [d.label, d.value]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [220, 49, 115],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: marginX, right: marginX },
  });

  // Zone Heatmap
  y += 20 + orderReportData.ordersByZone?.length * 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Zone Heatmap", marginX, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Zone", "Hour", "Orders"]],
    body: orderReportData.zoneHeatmap?.map((d) => [
      d.zone,
      d.hour,
      d.orderCount,
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [220, 49, 115],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: marginX, right: marginX },
  });

  // footer section
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, {
      align: "center",
    });
  }

  doc.save(`order_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`);
};
