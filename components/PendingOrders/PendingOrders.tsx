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
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { format, formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Clock, Eye, Loader, MapPin, ShoppingBag } from "lucide-react";
import { useState } from "react";

// DELIGO theme
const DELIGO = "#DC3173";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

const sortOptions = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Oldest First", value: "createdAt" },
];

export default function PendingOrders({ ordersResult }: IProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TOrder | null>(null);

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-extrabold flex items-center gap-3 mb-6">
          <Clock className="w-8 h-8" style={{ color: DELIGO }} /> {t("pending_orders")}
        </h1>
      </motion.div>

      {/* FILTERS */}
      <AllFilters sortOptions={sortOptions} />

      {/* CARD WRAPPER */}
      <Card className="p-6 bg-white shadow-sm rounded-2xl">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-slate-600" /> {t("live_pending_orders")}
        </h2>
        <Separator className="mb-4" />

        {/* ORDERS LIST */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {ordersResult?.data?.map((order) => (
            <motion.div
              key={order._id}
              whileHover={{ scale: 1.01 }}
              className="p-4 bg-slate-50 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer"
            >
              {/* LEFT SECTION */}
              <div className="flex items-center gap-4 min-w-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={order.customerId?.profilePhoto || ""} />
                  <AvatarFallback>
                    {order.customerId?.name?.firstName?.charAt(0)}
                    {order.customerId?.name?.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">
                    {order.customerId?.name?.firstName}{" "}
                    {order.customerId?.name?.lastName}
                  </p>
                  <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                    <span>
                      {order.deliveryAddress?.street},{" "}
                      {order.deliveryAddress?.city}
                    </span>
                  </p>
                  <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                    <div className="w-3">
                      <ShoppingBag className="w-3 h-3" />
                    </div>
                    <span>{order.vendorId?.businessDetails?.businessName}</span>
                  </p>

                  <Badge
                    variant="outline"
                    className="mt-1 border-amber-500 text-amber-600"
                  >
                    {order.totalItems} {t("items")}
                  </Badge>
                </div>
              </div>

              {/* RIGHT SECTION */}
              <div className="text-right min-w-[120px]">
                <p className="text-sm text-slate-500">{t("amount")}</p>
                <p className="text-lg font-bold">
                  € {order.totalPrice?.toLocaleString()}
                </p>

                <p className="text-xs text-slate-500">
                  {formatDistanceToNow(new Date(order.createdAt), {
                    addSuffix: true,
                  })}
                </p>

                <div className="mt-2 flex items-center gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelected(order)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {ordersResult?.meta?.total === 0 && (
            <div>
              <div className="py-8 text-center text-slate-500">
                {t("no_orders_found")}
              </div>
            </div>
          )}
        </div>
      </Card>

      {!!ordersResult?.meta?.total && ordersResult?.meta?.total > 0 && (
        <div className="px-6 pb-4 mt-4">
          <PaginationComponent
            totalPages={ordersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

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
                <p className="text-sm text-slate-500">{t("delivery_timeline")}</p>
                <ul className="mt-2 text-sm space-y-2">
                  <li>
                    • {t("created")}: {format(selected.createdAt, "do MMM yyyy")}
                  </li>
                  <li>
                    • {t('rider')}: {selected.deliveryPartnerId?.name?.firstName}{" "}
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
