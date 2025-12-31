/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Download, Eye, Navigation } from "lucide-react";
import { useState } from "react";

// Deligo brand
const DELIGO = "#DC3173";
const SAMPLE_AVATAR = "/mnt/data/Screenshot from 2025-11-21 00-13-57.png";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

export default function OnTheWayOrders({ ordersResult }: IProps) {
  const [selected, setSelected] = useState<TOrder | null>(null);

  function exportCSV() {
    const head = [
      "ID",
      "Restaurant",
      "Customer",
      "Amount",
      "ETA",
      "City",
      "Items",
      "Created",
    ];
    const rows = ordersResult?.data?.map((o) => [
      o._id,
      `${o.vendorId?.name?.firstName} ${o.vendorId?.name?.lastName}`,
      `${o.customerId?.name?.firstName} ${o.customerId?.name?.lastName}`,
      o.totalPrice,
      o.deliveryAddress?.city,
      o.items.map((i: any) => `${i.quantity}x ${i.productId?.name}`).join("|"),
      format(o.createdAt, "yyyy-MM-dd HH:mm"),
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `on_the_way_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-3">
              <Navigation className="w-8 h-8" style={{ color: DELIGO }} /> On
              The Way Orders
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Live tracking — delivery partner location, ETA and customer
              coordination.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={exportCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </motion.div>

      {/* KPI */}
      {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard title="On The Way" value={filtered.length} icon={Truck} accent={DELIGO} />
        <KPICard title="Avg ETA" value={`${calcAvgETA(filtered)} min`} icon={Clock} accent="#0EA5E9" />
        <KPICard title="High Delay" value={filtered.filter(o=>o.etaDelay).length} icon={AlertTriangle} accent="#F97316" />
        <KPICard title="Cities" value={new Set(filtered.map(o=>o.city)).size} icon={MapPin} accent="#10B981" />
      </div> */}

      {/* GRID table replacement */}
      <Card className="p-4 overflow-x-auto">
        {/* header row (sticky-looking inside card) */}
        <div className="bg-slate-100/80 rounded-md px-3 py-2 mb-4 font-semibold text-slate-700 grid grid-cols-3 items-center">
          <div>Order</div>
          <div>Customer</div>
          <div className="text-center">Actions</div>
        </div>

        <div className="space-y-4">
          {ordersResult?.data?.map((o) => (
            <div
              key={o._id}
              className="grid grid-cols-3 gap-4 items-center p-4 bg-white rounded-lg border hover:shadow-sm"
            >
              {/* Order col */}
              <div className="flex flex-col">
                <span className="font-semibold">{o._id}</span>
                <span className="text-xs text-slate-500">
                  {new Date(o.createdAt).toLocaleTimeString()}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  € {o.totalPrice.toLocaleString()}
                </span>
              </div>

              {/* Customer col */}
              <div className="flex items-start gap-3 min-w-0">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={SAMPLE_AVATAR} />
                  <AvatarFallback>
                    {o.customerId?.name?.firstName?.charAt(0)}
                    {o.customerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="font-medium truncate">
                    {o.customerId?.name?.firstName}{" "}
                    {o.customerId?.name?.lastName}
                  </span>
                  <span className="text-xs text-slate-500 truncate">
                    {o.customerId?.address?.city}
                  </span>
                  <span className="text-xs text-slate-400 mt-1 truncate">
                    {o.items
                      .map(
                        (it: any) => `${it.quantity}× ${it?.productId?.name}`
                      )
                      .join(", ")}
                  </span>
                </div>
              </div>

              {/* Actions col */}
              <div className="text-center">
                <div className="flex items-center gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(o)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Details sheet */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="max-w-2xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>Order Details</SheetTitle>
            <SheetDescription>Full route, ETA, partner info</SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selected.customerId?.profilePhoto} />
                  <AvatarFallback>
                    {selected.customerId?.name?.firstName?.charAt(0)}
                    {selected.customerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {/* <h3 className="text-xl font-bold">{selected.restaurant} — {selected.id}</h3> */}
                  <p className="text-sm text-slate-500">
                    Customer: {selected.customerId?.name?.firstName}{" "}
                    {selected.customerId?.name?.lastName}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-semibold">Items</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {selected.items.map((it, idx) => (
                    <li key={idx}>
                      {it.quantity}× {it.productId?.name}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Partner</p>
                  <p className="font-semibold">
                    {selected.deliveryPartnerId?.name?.firstName}{" "}
                    {selected.deliveryPartnerId?.name?.lastName}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// function KPICard({ title, value, icon: Icon, accent }: any) {
//   return (
//     <Card className="p-4 flex items-center justify-between">
//       <div>
//         <p className="text-xs text-slate-500">{title}</p>
//         <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
//       </div>
//       <div className="p-3 rounded-xl" style={{ background: `${accent}20` }}>
//         <Icon className="w-5 h-5" style={{ color: accent }} />
//       </div>
//     </Card>
//   );
// }

// function calcAvgETA(arr:any[]){ return arr.length? Math.round(arr.reduce((s,a)=>s+a.eta,0)/arr.length):0; }
