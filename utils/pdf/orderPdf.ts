import { TOrder } from "@/types/order.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderReportMeta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

export const generateOrderPDF = (
    orders: TOrder[],
    meta?: OrderReportMeta,
) => {
    const doc = new jsPDF("l", "mm", "a4"); // landscape
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const marginX = 12;
    const usableWidth = pageWidth - marginX * 2; // full usable width

    // ========== HEADER ==========
    const headerTop = 12;
    const logoSize = 16;

    doc.addImage("/deligoLogo.png", "PNG", marginX, headerTop, logoSize, logoSize);

    const textX = marginX + logoSize + 5;
    let currentY = headerTop + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("PIXELMIRACLE, LDA", textX, currentY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    currentY += 4;
    doc.text("Avenida do Brasil, nº 43, 6º D", textX, currentY);
    currentY += 3.5;
    doc.text("1700-062 Lisboa, Portugal", textX, currentY);
    currentY += 3.5;
    doc.text("NIF: 518758176 | Email: contact@deligo.pt", textX, currentY);
    currentY += 3.5;
    doc.setTextColor(220, 49, 115);
    doc.text("www.deligo.pt", textX, currentY);
    doc.setTextColor(0);

    // Right side title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Orders Report", pageWidth - marginX, headerTop + 5, {
        align: "right",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
        `Generated: ${format(new Date(), "yyyy-MM-dd HH:mm")}`,
        pageWidth - marginX,
        headerTop + 11,
        { align: "right" },
    );

    if (meta) {
        doc.text(
            `Page ${meta.page} of ${meta.totalPage}  |  Showing ${orders.length} of ${meta.total} orders`,
            pageWidth - marginX,
            headerTop + 16,
            { align: "right" },
        );
    }

    // Divider
    const dividerY = Math.max(headerTop + logoSize, currentY) + 6;
    doc.setDrawColor(220, 49, 115);
    doc.setLineWidth(0.6);
    doc.line(marginX, dividerY, pageWidth - marginX, dividerY);

    // ========== SUMMARY ==========
    let y = dividerY + 8;

    const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.payoutSummary?.grandTotal || 0),
        0,
    );
    const statusCount: Record<string, number> = {};
    const paymentCount: Record<string, number> = {};

    orders.forEach((o) => {
        statusCount[o.orderStatus] = (statusCount[o.orderStatus] || 0) + 1;
        paymentCount[o.paymentStatus] = (paymentCount[o.paymentStatus] || 0) + 1;
    });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Summary", marginX, y);
    y += 6;

    const boxWidth = (usableWidth - 12) / 4;
    const boxes = [
        { label: "Orders on Page", value: String(orders.length) },
        { label: "Total Revenue", value: `€${formatPrice(totalRevenue)}` },
        { label: "Paid Orders", value: String(paymentCount["PAID"] || 0) },
        {
            label: "Awaiting Partner",
            value: String(statusCount["AWAITING_PARTNER"] || 0),
        },
    ];

    boxes.forEach((box, i) => {
        const x = marginX + i * (boxWidth + 4);
        doc.setFillColor(248, 248, 248);
        doc.roundedRect(x, y, boxWidth, 14, 2, 2, "F");
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(box.label, x + 3, y + 5);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setTextColor(0);
        doc.text(box.value, x + 3, y + 11);
    });

    y += 20;

    // ========== ORDERS TABLE ==========
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text("Orders List", marginX, y);
    y += 3;

    const tableBody = orders.map((order) => {
        const customerName = order.customerId
            ? `${order.customerId.name?.firstName || ""} ${order.customerId.name?.lastName || ""}`.trim()
            : "—";

        const vendorName =
            order.vendorId?.businessDetails?.businessName ||
            `${order.vendorId?.name?.firstName || ""} ${order.vendorId?.name?.lastName || ""}`.trim() ||
            "—";

        const itemsCount = order.totalItems || order.items?.length || 0;
        const total = order.payoutSummary?.grandTotal ?? 0;

        return [
            order.orderId || "—",
            format(new Date(order.createdAt), "dd/MM/yyyy HH:mm"),
            customerName,
            vendorName,
            order.orderStatus?.replaceAll("_", " ") || "—",
            order.paymentStatus || "—",
            order.paymentMethod?.replaceAll("_", " ") || "—",
            String(itemsCount),
            `€${formatPrice(total)}`,
        ];
    });

    autoTable(doc, {
        startY: y,
        head: [
            [
                "Order ID",
                "Date",
                "Customer",
                "Vendor",
                "Status",
                "Payment",
                "Method",
                "Items",
                "Total",
            ],
        ],
        body: tableBody,
        tableWidth: usableWidth, // ← forces table to use full width
        styles: {
            fontSize: 7.5,
            cellPadding: 2.2,
            overflow: "linebreak",
            valign: "middle",
        },
        headStyles: {
            fillColor: [220, 49, 115],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 8,
        },
        alternateRowStyles: {
            fillColor: [252, 245, 248],
        },
        // Proportional widths that add up to 100% of usableWidth
        columnStyles: {
            0: { cellWidth: usableWidth * 0.13 }, // Order ID
            1: { cellWidth: usableWidth * 0.12 }, // Date
            2: { cellWidth: usableWidth * 0.14 }, // Customer
            3: { cellWidth: usableWidth * 0.16 }, // Vendor
            4: { cellWidth: usableWidth * 0.13 }, // Status
            5: { cellWidth: usableWidth * 0.09 }, // Payment
            6: { cellWidth: usableWidth * 0.10 }, // Method
            7: { cellWidth: usableWidth * 0.05, halign: "center" }, // Items
            8: { cellWidth: usableWidth * 0.08, halign: "right" }, // Total
        },
        margin: { left: marginX, right: marginX },
        didDrawPage: (data) => {
            const pageCount = doc.getNumberOfPages();
            doc.setFontSize(8);
            doc.setTextColor(140);
            doc.text(
                `Page ${data.pageNumber} of ${pageCount}`,
                pageWidth / 2,
                pageHeight - 8,
                { align: "center" },
            );
            doc.text(
                "Confidential – Deligo Internal Use Only",
                marginX,
                pageHeight - 8,
            );
        },
    });

    doc.save(
        `orders_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.pdf`,
    );
};