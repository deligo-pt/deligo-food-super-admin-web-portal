"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Download, X } from "lucide-react";
import { useState } from "react";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

export default function CancelledOrders({ ordersResult }: IProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TOrder | null>(null);
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  const exportCSV = () => {
    const header = [
      "id",
      "customerName",
      "deliveryPartner",
      "reason",
      "total",
      "cancelledAt",
      "paymentMethod",
      "address",
    ];
    const rows = ordersResult?.data?.map((o) => [
      o.orderId,
      `${o.customerId?.name?.firstName} ${o.customerId?.name?.lastName}`,
      `${o.deliveryPartnerId?.name?.firstName} ${o.deliveryPartnerId?.name?.lastName}`,
      o.cancelReason,
      o.totalPrice.toLocaleString(),
      o.updatedAt,
      o.paymentMethod,
      o.deliveryAddress?.city,
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cancelled-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#DC3173] flex items-center gap-2">
              <AlertTriangle className="text-[#DC3173]" /> {t("cancelled_orders")}
            </h1>
            <p className="text-slate-500 text-sm">
              {t("cancelled_orders_desc")}
            </p>
          </div>

          <div>
            <button
              onClick={() => exportCSV()}
              className="bg-[#DC3173] text-white px-4 py-2 rounded-lg flex gap-2 items-center"
            >
              <Download /> {t("export")}
            </button>
          </div>
        </div>
      </motion.div>

      <AllFilters sortOptions={sortOptions} />

      {/* LIST */}
      <div>
        {/* Middle & Right: List and details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            {/* TABLE (desktop) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-3">{t("order")}</th>
                    <th className="p-3">{t("customer")}</th>
                    <th className="p-3">{t("delivery_partner")}</th>
                    <th className="p-3">{t("amount")}</th>
                    <th className="p-3">{t("cancelled_at")}</th>
                    <th className="p-3">{t("reason")}</th>
                    <th className="p-3">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {ordersResult?.data?.map((o) => (
                      <motion.tr
                        key={o._id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="border-t hover:bg-[#DC317310] transition cursor-pointer"
                      >
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          <div className="text-xs text-slate-400">
                            {o.orderId}
                          </div>
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          {o.customerId?.name?.firstName}{" "}
                          {o.customerId?.name?.lastName}
                          <div className="text-xs text-slate-400">
                            {o.customerId?.address?.city}
                          </div>
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          <span className="px-3 py-1 rounded-full bg-[#DC317320] text-[#DC3173] text-xs font-medium">
                            {o.deliveryPartnerId?.name?.firstName}{" "}
                            {o.deliveryPartnerId?.name?.lastName}
                          </span>
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          € {o.totalPrice.toLocaleString()}
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          {format(o.updatedAt, "dd/MM/yyyy")}
                        </td>
                        <td className="p-3 align-top text-slate-600 max-w-60 overflow-hidden text-ellipsis whitespace-nowrap">
                          {o.cancelReason}
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-60 overflow-hidden text-ellipsis">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelected(o)}
                              className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition"
                            >
                              {t("details")}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {ordersResult?.meta?.total === 0 && (
                      <tr>
                        <td
                          colSpan={11}
                          className="py-8 text-center text-slate-500"
                        >
                          {t("no_orders_found")}
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden grid gap-3 overflow-x-auto">
              {ordersResult?.data?.map((o) => (
                <motion.div
                  key={o._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-slate-500">
                        € {o.totalPrice.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {o.customerId?.name?.firstName}{" "}
                        {o.customerId?.name?.lastName} —{" "}
                        {o.customerId?.address?.city}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        {format(o.updatedAt, "dd/MM/yyyy")}
                      </div>
                      <div className="mt-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173]"
                        >
                          {t("details")}
                        </button>
                      </div>
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

            {/* Pagination */}
          </div>
        </div>
      </div>

      {!!ordersResult?.meta?.total && ordersResult?.meta?.total > 0 && (
        <div className="px-6 pb-4">
          <PaginationComponent
            totalPages={ordersResult?.meta?.totalPage || 0}
          />
        </div>
      )}

      {/* Modal: Order Details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 lg:p-8"
          >
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSelected(null)}
            />
            <motion.div
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">
                    {selected.orderId}
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded hover:bg-slate-100"
                >
                  <X />
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">{t("customer")}</div>
                  <div className="font-medium">
                    {selected.customerId?.name?.firstName}{" "}
                    {selected.customerId?.name?.lastName}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {selected.customerId?.address?.city}
                  </div>

                  <div className="mt-4 text-sm text-slate-500">
                    {t("delivery_partner")}
                  </div>
                  <div className="inline-block px-3 py-1 mt-1 rounded bg-[#DC317320] text-[#DC3173] text-sm font-medium">
                    {selected.deliveryPartnerId?.name?.firstName}{" "}
                    {selected.deliveryPartnerId?.name?.lastName}
                  </div>

                  <div className="mt-4 text-sm text-slate-500">
                    {t("payment_eur")}
                  </div>
                  <div className="font-medium">
                    {selected.paymentMethod} · €{" "}
                    {selected.totalPrice.toLocaleString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">{t("cancelled_at")}</div>
                  <div className="font-medium">
                    {format(selected.updatedAt, "dd/MM/yyyy")}
                  </div>

                  <div className="mt-4 text-sm text-slate-500">{t("reason")}</div>
                  <div className="font-medium text-slate-700">
                    {selected.cancelReason}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {t("order_id")}:{" "}
                  <span className="text-slate-700">{selected.orderId}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
