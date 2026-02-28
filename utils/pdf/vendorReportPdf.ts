import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { TVendor } from "@/types/user.type";


export const generateVendorReportPDF = (vendors: TVendor[]) => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 15;

    // header section
    const headerTop = 15;
    const logoSize = 18;

    // Logo
    doc.addImage("/deligoLogo.png", "PNG", marginX, headerTop, logoSize, logoSize);

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
    doc.text("Vendor Report", pageWidth - marginX, headerTop + 5, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        `Generated: ${format(new Date(), "yyyy-MM-dd")}`,
        pageWidth - marginX,
        headerTop + 11,
        { align: "right" }
    );

    // Divider
    const dividerY = Math.max(headerTop + logoSize, currentY) + 8;
    doc.setDrawColor(220, 49, 115);
    doc.line(marginX, dividerY, pageWidth - marginX, dividerY);


    // table section
    autoTable(doc, {
        startY: dividerY + 6,
        head: [
            [
                "Vendor",
                "Owner",
                "Rating",
                "Orders",
                "Joined",
                "Status",
            ],
        ],
        body: vendors.map((v) => [
            v.businessDetails?.businessName ?? "N/A",
            `${v.name?.firstName ?? ""} ${v.name?.lastName ?? ""}`.trim() || "N/A",
            v.rating?.average ?? "N/A",
            v.totalOrders ?? 0,
            v.createdAt ? format(new Date(v.createdAt), "yyyy-MM-dd") : "N/A",
            v.status,
        ]),
        styles: {
            fontSize: 9,
            cellPadding: 3,
            valign: "middle",
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
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            290,
            { align: "center" }
        );
    }

    doc.save(
        `vendor_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`
    );
};