"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState } from "react";

import { BadgeEuro, Download, Eye, MapPin } from "lucide-react";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";

// Brand color
const DELIGO = "#DC3173";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

export default function AllOrders({ ordersResult }: IProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TOrder | null>(null);
  const [exporting, setExporting] = useState(false);
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  // Export CSV
  function exportCSV() {
    const head = [
      "ID",
      "Customer",
      "Partner",
      "Amount",
      "Status",
      "City",
      "Items",
      "Payment",
      "Created",
      "Delivered",
      "Address",
    ];

    const rows = ordersResult?.data?.map((o) => [
      o.orderId,
      o.customerId?.name?.firstName + " " + o.customerId?.name?.lastName,
      o.deliveryPartnerId?.name?.firstName +
        " " +
        o.deliveryPartnerId?.name?.lastName,
      o.finalAmount?.toLocaleString(),
      o.orderStatus,
      o.deliveryAddress?.city,
      o.items?.map((i) => i.productId?.name + " x " + i.quantity).join(" | "),
      o.paymentStatus,
      format(o.createdAt, "do MMM yyyy"),
      o.deliveredAt ?? "-",
      o.deliveryAddress?.street +
        ", " +
        o.deliveryAddress?.postalCode +
        ", " +
        o.deliveryAddress?.city +
        ", " +
        o.deliveryAddress?.country,
    ]);

    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `all_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Export PDF (simple print fallback)
  async function exportPDF() {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.getElementById("orders-print-area");
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(`orders_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      // fallback

      console.warn("PDF failed", e);
      window.print();
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 max-w-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <BadgeEuro className="w-8 h-8" style={{ color: DELIGO }} />{" "}
              {t("all_orders")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{t("")}</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={exportCSV} className="flex items-center gap-2">
              <Download className="w-4 h-4" /> {t("export_csv")}
            </Button>
            <Button
              onClick={exportPDF}
              className="flex items-center gap-2"
              disabled={exporting}
            >
              <Download className="w-4 h-4" /> {t("export_pdf")}
            </Button>
          </div>
        </div>
      </motion.div>

      <AllFilters sortOptions={sortOptions} />

      {/* Printable wrapper */}
      <div id="orders-print-area" className="space-y-6 max-w-full">
        {/* Quick KPIs */}
        {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="p-4">
            <p className="text-xs text-slate-500">Total Orders</p>
            <h3 className="text-2xl font-bold">{ordersResult?.meta?.total}</h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Completed</p>
            <h3 className="text-2xl font-bold">
              {orders.filter((o) => o.status === "Completed").length}
            </h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Pending</p>
            <h3 className="text-2xl font-bold">
              {orders.filter((o) => o.status === "Pending").length}
            </h3>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-slate-500">Revenue</p>
            <h3 className="text-2xl font-bold">
              € {orders.reduce((s, o) => s + o.amount, 0).toLocaleString()}
            </h3>
          </Card>
        </div> */}

        {/* Orders table */}
        <Card className="p-4 max-w-full overflow-x-auto">
          <table className="w-full text-sm max-w-full">
            <thead className="bg-slate-100 text-slate-700 font-semibold">
              <tr>
                <th className="px-4 py-2 text-left w-[140px]">
                  {t("order_id")}
                </th>
                <th className="px-4 py-2 text-left w-[260px]">
                  {t("customer")}
                </th>
                {/* <th className="px-4 py-2 text-left w-[260px]">Partner</th> */}
                <th className="px-4 py-2 text-center w-[100px]">
                  {t("amount")}
                </th>
                <th className="px-4 py-2 text-center w-[120px]">
                  {t("status")}
                </th>
                {/* <th className="px-4 py-2 text-center w-[120px]">City</th> */}
                <th className="px-4 py-2 text-center w-[80px]">{t("items")}</th>
                {/* <th className="px-4 py-2 text-center w-[120px]">Payment</th> */}
                <th className="px-4 py-2 text-center w-[160px]">
                  {t("created")}
                </th>
                {/* <th className="px-4 py-2 text-center w-[160px]">Delivered</th> */}
                <th className="px-4 py-2 text-center w-[120px]">
                  {t("actions")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {ordersResult?.data?.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{o.orderId}</td>

                  {/* Customer */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={o.customerId?.profilePhoto} />
                        <AvatarFallback>
                          {o.customerId?.name?.firstName?.charAt(0)}
                          {o.customerId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {o.customerId?.name?.firstName}{" "}
                          {o.customerId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {o.deliveryAddress.street}, {o.deliveryAddress.city}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Partner */}
                  {/* <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={o.deliveryPartnerId?.profilePhoto} />
                        <AvatarFallback>
                          {o.deliveryPartnerId?.name?.firstName?.charAt(0)}
                          {o.deliveryPartnerId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {o.deliveryPartnerId?.name?.firstName}{" "}
                          {o.deliveryPartnerId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {o.deliveryPartnerId?.address?.street},{" "}
                          {o.deliveryPartnerId?.address?.city}
                        </div>
                      </div>
                    </div>
                  </td> */}

                  <td className="px-4 py-3 text-center font-semibold">
                    € {o.totalPrice?.toLocaleString()}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <Badge className="text-xs bg-[#DC313]">
                      {o.orderStatus}
                    </Badge>
                  </td>

                  {/* <td className="px-4 py-3 text-center">
                    {o.deliveryAddress?.city}
                  </td> */}
                  <td className="px-4 py-3 text-center flex flex-col">
                    {o.items?.map((i, index) => (
                      <span key={index}>
                        {i.productId?.name} x {i.quantity}
                      </span>
                    ))}
                  </td>
                  {/* <td className="px-4 py-3 text-center">{o.paymentStatus}</td> */}
                  <td className="px-4 py-3 text-center">
                    {format(o.createdAt, "dd/MM/yyyy")}
                  </td>
                  {/* <td className="px-4 py-3 text-center">
                    {o.deliveredAt ? format(o.deliveredAt, "dd/MM/yyyy") : "-"}
                  </td> */}

                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(o)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {/* <Button
                        size="sm"
                        onClick={() => alert("Open refund modal (mock)")}
                      >
                        Refund
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}

              {ordersResult?.meta?.total === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    {t("no_orders_found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Small charts + metrics */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4">
            <h4 className="font-semibold">Orders over time</h4>
            <div className="h-40 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ordersChart(ordersResult?.data || [])}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    stroke={DELIGO}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold">Top Cities</h4>
            <div className="mt-3 text-sm text-slate-600">
              {topCities(ordersResult?.data || []).map((c) => (
                <div
                  key={c.city}
                  className="flex items-center justify-between py-1"
                >
                  <div>{c.city}</div>
                  <div className="font-semibold">{c.count}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold">Payment Breakdown</h4>
            <div className="mt-3 text-sm text-slate-600">
              {paymentBreakdown(ordersResult?.data || []).map((p) => (
                <div
                  key={p.method}
                  className="flex items-center justify-between py-1"
                >
                  <div>{p.method}</div>
                  <div className="font-semibold">{p.count}</div>
                </div>
              ))}
            </div>
          </Card>
        </div> */}
      </div>

      {!!ordersResult?.meta?.total && ordersResult?.meta?.total > 0 && (
        <div className="px-6 pb-4 mt-4">
          <PaginationComponent
            totalPages={ordersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      {/* Details Sheet */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="max-w-xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>{t("order_details")}</SheetTitle>
            <SheetDescription>
              {t("complete_information_about_selected_order")}
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-6">
              <div>
                <p className="text-sm text-slate-500">{t("order_id")}</p>
                <p className="text-lg font-semibold">{selected.orderId}</p>
              </div>

              <Separator />

              {/* Customer */}
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={selected?.customerId?.profilePhoto} />
                  <AvatarFallback>
                    {selected?.customerId?.name?.firstName?.charAt(0)}
                    {selected?.customerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {selected?.customerId?.name?.firstName}{" "}
                    {selected?.customerId?.name?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{" "}
                    {selected.deliveryAddress?.street},{" "}
                    {selected.deliveryAddress?.city}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Partner */}
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={selected?.deliveryPartnerId?.profilePhoto}
                  />
                  <AvatarFallback>
                    {selected.deliveryPartnerId?.name?.firstName?.charAt(0)}{" "}
                    {selected.deliveryPartnerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {selected.deliveryPartnerId?.name?.firstName}{" "}
                    {selected.deliveryPartnerId?.name?.lastName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selected.deliveryPartnerId?.address?.city}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-500">{t("amount")}</p>
                  <p className="font-semibold">
                    € {selected.totalPrice?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t("items")}</p>
                  <p className="font-semibold">
                    {selected.items?.map((item, i) => (
                      <span key={i}>
                        {item?.productId?.name} x {item?.quantity}
                      </span>
                    ))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t("payment")}</p>
                  <p className="font-semibold">{selected.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">{t("status")}</p>
                  <p className="font-semibold">{selected.orderStatus}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm text-slate-500">
                  {t("delivery_timeline")}
                </p>
                <ul className="mt-2 text-sm space-y-2">
                  <li>
                    • {t("created")}:{" "}
                    {format(selected.createdAt, "do MMM yyyy")}
                  </li>
                  <li>
                    • {t("rider")}:{" "}
                    {selected.deliveryPartnerId?.name?.firstName}{" "}
                    {selected.deliveryPartnerId?.name?.lastName}
                  </li>
                  <li>
                    • {t("delivered")}:{" "}
                    {selected.deliveredAt
                      ? format(selected.deliveredAt, "do MMM yyyy")
                      : "—"}
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  {t("close")}
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------- Helpers & Mocks ----------------
// function ordersChart(orders: TOrder[]) {
//   // aggregate by day label (last 7 days)
//   const days = Array.from({ length: 7 }).map((_, i) => {
//     const d = new Date();
//     d.setDate(d.getDate() - (6 - i));
//     const label = d.toLocaleDateString();
//     const count = orders.filter(
//       (o) => new Date(o.createdAt).toDateString() === d.toDateString()
//     ).length;
//     return { label, orders: count };
//   });
//   return days;
// }

// function topCities(orders: TOrder[]) {
//   const map: Record<string, number> = {};
//   orders.forEach(
//     (o) =>
//       (map[o.deliveryAddress?.city as string] =
//         (map[o.deliveryAddress?.city as string] || 0) + 1)
//   );
//   return Object.entries(map)
//     .map(([city, count]) => ({ city, count }))
//     .sort((a, b) => b.count - a.count)
//     .slice(0, 5);
// }

// function paymentBreakdown(orders: TOrder[]) {
//   const methods: Record<string, number> = {};
//   orders.forEach(
//     (o) => (methods[o.paymentStatus] = (methods[o.paymentStatus] || 0) + 1)
//   );
//   return Object.entries(methods).map(([method, count]) => ({ method, count }));
// }
