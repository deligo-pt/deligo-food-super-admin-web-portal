import { TOrder } from "@/types/order.type";
import { formatPrice } from "@/utils/formatPrice";
import { format } from "date-fns";

interface OrderReportMeta {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
}

export function generateOrderCSV(
    orders: TOrder[],
    meta?: OrderReportMeta,
) {
    const rows: (string | number | undefined | null)[][] = [];

    // ===== HEADER INFO =====
    rows.push(["ORDERS REPORT"]);
    rows.push([`Generated At`, format(new Date(), "yyyy-MM-dd HH:mm:ss")]);
    if (meta) {
        rows.push([`Page`, `${meta.page} of ${meta.totalPage}`]);
        rows.push([`Showing`, `${orders.length} of ${meta.total} orders`]);
    }
    rows.push([]);

    // ===== SUMMARY =====
    const totalRevenue = orders.reduce(
        (sum, o) => sum + (o.payoutSummary?.grandTotal || 0),
        0,
    );

    rows.push(["--- SUMMARY ---"]);
    rows.push(["Orders on this page", orders.length]);
    rows.push(["Total Revenue (this page)", `€${formatPrice(totalRevenue)}`]);
    rows.push([]);

    // ===== DETAILED ORDERS =====
    rows.push(["--- ORDERS LIST ---"]);
    rows.push([
        "Order ID",
        "Created At",
        "Customer Name",
        "Customer Phone",
        "Vendor / Business",
        "Order Status",
        "Payment Status",
        "Payment Method",
        "Fulfillment",
        "Items Count",
        "Total Quantity",
        "Items Subtotal",
        "Delivery Charge",
        "Tax Amount",
        "Grand Total (€)",
        "Delivery Address",
        "City",
        "Postal Code",
    ]);

    orders.forEach((order) => {
        const customerName = order.customerId
            ? `${order.customerId.name?.firstName || ""} ${order.customerId.name?.lastName || ""}`.trim()
            : "";

        const vendorName =
            order.vendorId?.businessDetails?.businessName ||
            `${order.vendorId?.name?.firstName || ""} ${order.vendorId?.name?.lastName || ""}`.trim();

        const address = order.deliveryAddress
            ? `${order.deliveryAddress.street || ""} ${order.deliveryAddress.detailedAddress || ""}`.trim()
            : "";

        rows.push([
            order.orderId,
            format(new Date(order.createdAt), "yyyy-MM-dd HH:mm"),
            customerName,
            order.customerId?.contactNumber || "",
            vendorName,
            order.orderStatus,
            order.paymentStatus,
            order.paymentMethod,
            order.fulfillmentType,
            order.totalItems || order.items?.length || 0,
            order.totalQuantity || 0,
            order.orderCalculation?.itemsSubtotal ?? "",
            order.delivery?.totalDeliveryCharge ?? "",
            order.orderCalculation?.totalTaxAmount ?? "",
            order.payoutSummary?.grandTotal ?? "",
            address,
            order.deliveryAddress?.city || "",
            order.deliveryAddress?.postalCode || "",
        ]);
    });

    // ===== BUILD CSV =====
    const csv = rows
        .map((r) =>
            r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_report_${format(new Date(), "yyyy-MM-dd_HH-mm-ss")}.csv`;
    a.click();

    URL.revokeObjectURL(url);
}