import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TCustomer } from "@/types/user.type";
import { format } from "date-fns";

export const generateCustomerReportPDF = (customers: TCustomer[]) => {
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
        logoSize
    );

    // Company info
    const companyTextX = marginX + logoSize + 6;
    let currentY = headerTop + 5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("PIXELMIRACLE, LDA", companyTextX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    currentY += 5;
    doc.text("Avenida do Brasil, nº 43, 6º D", companyTextX, currentY);

    currentY += 4;
    doc.text("1700-062 Lisboa, Portugal", companyTextX, currentY);

    currentY += 4;
    doc.text("NIF: 518758176", companyTextX, currentY);

    currentY += 4;
    doc.text("Email: contact@deligo.pt", companyTextX, currentY);

    currentY += 4;
    doc.setTextColor(220, 49, 115);
    doc.text("www.deligo.pt", companyTextX, currentY);
    doc.setTextColor(0);

    // Right-side meta
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Customer Report", pageWidth - marginX, headerTop + 5, {
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

    // divider
    const dividerY = Math.max(
        headerTop + logoSize,
        currentY
    ) + 8;

    doc.setDrawColor(220, 49, 115);
    doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

    // table section
    autoTable(doc, {
        startY: dividerY + 6,
        head: [
            [
                "Name",
                "Email",
                "Status",
                "Total Orders",
                "Total Spent (€)",
                "Last Order Date",
            ],
        ],
        body: customers.map((c) => [
            `${c.name?.firstName ?? ""} ${c.name?.lastName ?? ""}`.trim() || "-",
            c.email ?? "-",
            c.status,
            c.orders?.totalOrders ?? 0,
            (c.orders?.totalSpent ?? 0).toFixed(2),
            c.orders?.lastOrderDate
                ? format(new Date(c.orders.lastOrderDate), "yyyy-MM-dd")
                : "N/A",
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
            { align: "center" }
        );
    }

    doc.save(
        `customer_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`
    );
};