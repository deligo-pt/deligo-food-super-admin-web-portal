import { ISalesReportAnalytics } from "@/types/report.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSalesReportPDF = (sales: ISalesReportAnalytics) => {
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
  doc.text("Admin Sales Report", pageWidth - marginX, headerTop + 5, {
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
  doc.text("Sales Summary", marginX, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Total Revenue: €${formatPrice(sales.summary.totalRevenue || 0)}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(`Completed Orders: ${sales.summary.completedOrders}`, marginX, y);
  y += 5;
  doc.text(`Cancelled Orders: ${sales.summary.cancelledOrders}`, marginX, y);
  y += 5;
  doc.text(
    `Average Order Value: €${formatPrice(sales.summary.avgOrderValue || 0)}`,
    marginX,
    y,
  );

  // revenue cards
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Revenue Highlights", marginX, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `This Week: €${formatPrice(sales.revenueCards.thisWeek || 0)}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(
    `This Month: €${formatPrice(sales.revenueCards.thisMonth || 0)}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(`Top Earning Day: ${sales.revenueCards.topEarningDay}`, marginX, y);

  // Revenue trends
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Revenue Trends", marginX, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Date", "Revenue (€)"]],
    body: sales.charts.revenueTrend.map((d) => [
      d.date,
      formatPrice(d.revenue || 0),
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

  doc.save(`sales_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`);
};
