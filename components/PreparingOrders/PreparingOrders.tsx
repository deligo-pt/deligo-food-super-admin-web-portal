"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
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
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { motion } from "framer-motion";
import { Clock, Download, Eye } from "lucide-react";
import { useState } from "react";

// Deligo primary
const DELIGO = "#DC3173";
const SAMPLE_AVATAR = "/images/avatar-sample.jpg";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function PreparingOrders({ ordersResult }: IProps) {
  const [selected, setSelected] = useState<TOrder | null>(null);

  function exportCSV() {
    const head = [
      "ID",
      "Restaurant",
      "Customer",
      "Amount",
      "Status",
      "City",
      "Items",
      "Created",
    ];
    const rows = ordersResult?.data?.map((o) => [
      o._id,
      `${o.vendorId?.name?.firstName} ${o.vendorId?.name?.lastName}`,
      `${o.customerId?.name?.firstName} ${o.customerId?.name?.lastName}`,
      o.totalPrice,
      o.orderStatus,
      o.deliveryAddress?.city,
      o.items.map((it) => `${it.quantity}x ${it.productId?.name}`).join("|"),
      o.createdAt,
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `preparing_orders_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Clock className="w-8 h-8" style={{ color: DELIGO }} />
              Preparing Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live kitchen dashboard — assign riders, track timers & manage
              delays.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>
      </motion.div>

      <AllFilters sortOptions={sortOptions} />
      {/* KPI row */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <KpiCard title="Preparing" value={`${orders.filter((o) => o.status === 'Preparing').length}`} accent={DELIGO} />
        <KpiCard title="Ready" value={`${orders.filter((o) => o.status === 'Ready').length}`} accent="#10B981" />
        <KpiCard title="Delayed" value={`${orders.filter((o) => o.status === 'Delayed').length}`} accent="#F97316" />
        <KpiCard title="Avg Prep (min)" value={`${Math.round(orders.reduce((s, o) => s + o.expectedReadyInMin, 0) / (orders.length || 1))}`} accent="#06B6D4" />
      </div> */}

      {/* Scroll container with fixed-layout table */}
      <Card className="p-4 overflow-x-auto">
        {/* Table wrapper gives a max width but allows horizontal scroll on narrow screens */}
        <div className="min-w-[1100px]">
          <table className="w-full table-fixed text-sm">
            <thead className="bg-slate-100 text-slate-700 text-left">
              <tr className="align-middle">
                <th className="px-4 py-3 w-28">Order</th>
                <th className="px-4 py-3 w-64">Restaurant / Performance</th>
                <th className="px-4 py-3 w-80">Customer & Items</th>
                <th className="px-4 py-3 w-28 text-center">Timer</th>
                <th className="px-4 py-3 w-28 text-center">ETA</th>
                <th className="px-4 py-3 w-28 text-center">Status</th>
                <th className="px-4 py-3 w-40 text-center">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {ordersResult?.data?.map((o) => (
                <tr key={o._id} className="hover:bg-slate-50 align-top">
                  {/* ORDER */}
                  <td className="px-4 py-4 align-middle">
                    <div className="font-semibold">{o.orderId}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(o.createdAt).toLocaleTimeString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      € {o.totalPrice.toFixed(2)}
                    </div>
                  </td>

                  {/* RESTAURANT */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {o.vendorId?.name?.firstName}{" "}
                          {o.vendorId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {o.vendorId?.businessLocation?.city}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <div
                        className="h-8 rounded-md bg-gradient-to-r from-slate-100 to-white"
                        aria-hidden
                      />
                    </div>
                  </td>

                  {/* CUSTOMER & ITEMS */}
                  <td className="px-4 py-4 align-middle">
                    <div className="flex items-start gap-3 min-w-0">
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={SAMPLE_AVATAR} />
                        <AvatarFallback>
                          {o.customerId?.name?.firstName?.charAt(0)}
                          {o.customerId?.name?.lastName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {o.customerId?.name?.firstName}{" "}
                          {o.customerId?.name?.lastName}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {o.customerId?.address?.city}
                        </div>
                        <div className="text-xs text-slate-400 mt-2 truncate">
                          {o.items
                            .map(
                              (it) => `${it.quantity}× ${it.productId?.name}`
                            )
                            .join(", ")}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="px-4 py-4 text-center align-middle">
                    <Badge className="bg-[#DC313]">{o.orderStatus}</Badge>
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 py-4 text-center align-middle">
                    <div className="flex items-center gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(o)}
                        aria-label={`View ${o._id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {ordersResult?.meta?.total === 0 && (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!!ordersResult?.meta?.total && ordersResult?.meta?.total > 0 && (
        <div className="px-6 pb-4 mt-4">
          <PaginationComponent
            totalPages={ordersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      {/* DETAILS SHEET */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Full details & quick actions</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={SAMPLE_AVATAR} />
                  <AvatarFallback>
                    {selected.customerId?.name?.firstName?.charAt(0)}
                    {selected.customerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-slate-500">
                    Customer: {selected.customerId?.name?.firstName}{" "}
                    {selected.customerId?.name?.lastName} •{" "}
                    {selected.customerId?.address?.city}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Items</h4>
                <ul className="mt-2 space-y-2">
                  {selected.items.map((it, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <div className="truncate">
                        {it.quantity} × {it.productId?.name}
                      </div>
                      <div className="text-sm text-slate-500">—</div>
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Order created</p>
                  <p className="font-semibold">
                    {new Date(selected.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="font-semibold">{selected.orderStatus}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
                {/* <Button
                    style={{ background: DELIGO }}
                    onClick={() => markReady(selected.id)}
                  >
                    Mark Ready
                  </Button> */}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// function KpiCard({
//   title,
//   value,
//   accent,
// }: {
//   title: string;
//   value: string;
//   accent?: string;
// }) {
//   return (
//     <Card className="p-4 flex items-center justify-between">
//       <div>
//         <p className="text-xs text-slate-500">{title}</p>
//         <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
//       </div>
//       <div
//         className="p-3 rounded-xl"
//         style={{ background: `${accent ?? DELIGO}1A` }}
//       >
//         <div style={{ color: accent ?? DELIGO }}>
//           <Truck className="w-5 h-5" />
//         </div>
//       </div>
//     </Card>
//   );
// }
