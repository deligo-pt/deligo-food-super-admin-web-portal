import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { TDeliveryPartner } from "@/types/delivery-partner.type";


export const generateDeliveryPartnerReportPDF = (
    partners: TDeliveryPartner[],
) => {
    const doc = new jsPDF("p", "mm", "a4");

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 15;


    // header section
    const headerTop = 15;
    const logoSize = 18;

    // Logo
    doc.addImage("/deligoLogo.png", "PNG", marginX, headerTop, logoSize, logoSize);

    // Company info (left)
    const textX = marginX + logoSize + 6;
    let y = headerTop + 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("PIXELMIRACLE, LDA", textX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    y += 5;
    doc.text("Avenida do Brasil, nº 43, 6º D", textX, y);

    y += 4;
    doc.text("1700-062 Lisboa, Portugal", textX, y);

    y += 4;
    doc.text("NIF: 518758176", textX, y);

    y += 4;
    doc.text("Email: contact@deligo.pt", textX, y);

    y += 4;
    doc.setTextColor(220, 49, 115);
    doc.text("www.deligo.pt", textX, y);
    doc.setTextColor(0);

    // Right-side meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Delivery Partner Report", pageWidth - marginX, headerTop + 5, {
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
    const dividerY = Math.max(headerTop + logoSize, y) + 8;
    doc.setDrawColor(220, 49, 115);
    doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

    // table section
    autoTable(doc, {
        startY: dividerY + 6,
        head: [
            [
                "Delivery Partner",
                "Vehicle",
                "Deliveries",
                "Rating",
                "Earnings (€)",
                "Joined",
                "Status",
            ],
        ],
        body: partners.map((dp) => [
            `${dp.name?.firstName ?? ""} ${dp.name?.lastName ?? ""}`.trim() || "N/A",
            dp.vehicleInfo?.vehicleType ?? "N/A",
            `${dp.operationalData?.completedDeliveries ?? 0}/${dp.operationalData?.totalDeliveries ?? 0
            }`,
            dp.operationalData?.rating?.average ?? 0,
            (dp.earnings?.totalEarnings ?? 0).toFixed(2),
            dp.createdAt ? format(new Date(dp.createdAt), "yyyy-MM-dd") : "N/A",
            dp.status,
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

    // footer section
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${pageCount}`,
            pageWidth / 2,
            290,
            { align: "center" },
        );
    }

    doc.save(
        `delivery_partner_report_${format(
            new Date(),
            "yyyy-MM-dd_HH-mm-ss",
        )}.pdf`,
    );
};