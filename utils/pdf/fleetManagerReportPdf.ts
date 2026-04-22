import { IFleetManagerReportAnalytics } from "@/types/report.type";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateFleetManagerReportPDF = (
  reportData: IFleetManagerReportAnalytics,
) => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;

  // header section
  const headerTop = 15;
  const logoSize = 18;

  // Logo
  doc.addImage(
    "/deligoLogo.png",
    "PNG",
    marginX,
    headerTop,
    logoSize,
    logoSize,
  );

  // Company info
  const textX = marginX + logoSize + 6;
  let currentY = headerTop + 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0);
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

  // Right meta
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Fleet Manager Report", pageWidth - marginX, headerTop + 5, {
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

  // divider
  const dividerY = Math.max(headerTop + logoSize, currentY) + 8;

  doc.setDrawColor(220, 49, 115);
  doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

  // summary
  let y = dividerY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Fleet Managers Summary", marginX, y);

  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text(
    `Total Fleet Managers: ${reportData.stats?.totalManagers}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(
    `Approved Fleet Managers: ${reportData.stats?.approvedManagers}`,
    marginX,
    y,
  );
  y += 5;
  doc.text(`Total Drivers: ${reportData.stats?.totalDrivers}`, marginX, y);
  y += 5;
  doc.text(
    `Total Deliveries: ${reportData.stats?.totalDeliveries}`,
    marginX,
    y,
  );

  // Fleet Manager Growth
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Fleet Manager Growth", marginX, y);

  y += 4;

  autoTable(doc, {
    startY: y,
    head: [["Time", ...reportData.fleetGrowths?.map((g) => g.time)]],
    body: [["Managers", ...reportData.fleetGrowths?.map((g) => g.managers)]],
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

  // Fleet Managers Status Distribution
  y += 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Status Distribution", marginX, y);

  y += 4;

  const statusKeys = Object.keys(reportData.statusDistribution);

  autoTable(doc, {
    startY: y,
    head: [
      [
        "Status",
        ...statusKeys?.map((key) => key.replace(/_/g, " ").toUpperCase()),
      ],
    ],
    body: [
      [
        "Managers",
        ...statusKeys.map(
          (key) =>
            reportData.statusDistribution[
              key as keyof IFleetManagerReportAnalytics["statusDistribution"]
            ],
        ),
      ],
    ],
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

  // footer
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, 290, {
      align: "center",
    });
  }

  doc.save(
    `fleet_manager_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`,
  );
};
