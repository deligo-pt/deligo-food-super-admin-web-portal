"use client";

import AllFilters from "@/components/Filtering/AllFilters";
import PaginationComponent from "@/components/Filtering/PaginationComponent";
import { useTranslation } from "@/hooks/use-translation";
import { TMeta } from "@/types";
import { TOrder } from "@/types/order.type";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { Download, X } from "lucide-react";
import { useState } from "react";

interface IProps {
  ordersResult: { data: TOrder[]; meta?: TMeta };
}

export default function DeliveredOrders({ ordersResult }: IProps) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TOrder | null>(null);
  const sortOptions = [
    { label: t("newest_first"), value: "-createdAt" },
    { label: t("oldest_first"), value: "createdAt" },
  ];

  // CSV export (basic)
  const exportCSV = () => {
    const header = [
      "id",
      "customerName",
      "deliveryPartner",
      "total",
      "deliveredAt",
      "paymentMethod",
      "address",
    ];

    const rows = ordersResult?.data?.map((o) => [
      o._id,
      `${o.customerId?.name?.firstName} ${o.customerId?.name?.lastName}`,
      `${o.deliveryPartnerId?.name?.firstName} ${o.deliveryPartnerId?.name?.lastName}`,
      o.totalPrice?.toString(),
      format(o.deliveredAt as Date, "yyyy-MM-dd HH:mm"),
      o.paymentMethod,
      `${o.deliveryAddress?.street} ${o.deliveryAddress?.city}`,
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivered-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Responsive render: table for lg+, cards for sm
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#DC3173]">
              {t("delivered_orders_portugal")}
            </h1>
            <p className="text-sm text-slate-400">
              {t("gestao_professional_das_encomendas")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV()}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg hover:opacity-95 transition"
            >
              <Download className="text-[#DC3173]" /> {t("export")}
            </button>
          </div>
        </div>
      </motion.div>

      <AllFilters sortOptions={sortOptions} />

      {/* Content area */}
      <div className="bg-white border rounded-xl shadow-md p-5 transition-all hover:shadow-lg">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="p-3">{t("order")}</th>
                <th className="p-3">{t("customer")}</th>
                <th className="p-3">{t("delivery_partner")}</th>
                <th className="p-3">{t("amount")}</th>
                <th className="p-3">{t("delivered_at")}</th>
                <th className="p-3">{t("payment")}</th>
                <th className="p-3">{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {ordersResult?.data?.map((o) => (
                  <motion.tr
                    key={o._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="border-t hover:bg-[#DC317310] transition-all cursor-default"
                  >
                    <td className="p-3 align-top">
                      <div className="text-xs text-slate-400">{o.orderId}</div>
                    </td>
                    <td className="p-3 align-top">
                      <div>{o.customerId?.name?.firstName}</div>
                      <div className="text-xs text-slate-400">
                        {o.customerId?.address?.city}
                      </div>
                    </td>
                    <td className="p-3 align-top">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#DC317320] text-[#DC3173] font-medium">
                        {o.deliveryPartnerId?.name?.firstName}{" "}
                        {o.deliveryPartnerId?.name?.lastName}
                      </span>
                    </td>
                    <td className="p-3 align-top">
                      € {o.totalPrice?.toFixed(2)}
                    </td>
                    <td className="p-3 align-top">
                      {format(o.deliveredAt as Date, "yyyy-MM-dd HH:mm")}
                    </td>
                    <td className="p-3 align-top">{o.paymentStatus}</td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition-all text-sm"
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
        <div className="lg:hidden grid grid-cols-1 gap-3">
          <AnimatePresence>
            {ordersResult?.data?.map((o) => (
              <motion.div
                key={o._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{o.orderId}</div>
                    <div className="text-sm text-slate-500">
                      {o.customerId?.name?.firstName}{" "}
                      {o.customerId?.name?.lastName} · €{" "}
                      {o.totalPrice?.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">
                      {format(o.deliveredAt as Date, "yyyy-MM-dd HH:mm")}
                    </div>
                    <div className="mt-2">
                      <button
                        onClick={() => setSelected(o)}
                        className="px-3 py-1 rounded border text-sm"
                      >
                        {t("details")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">
                  {o.customerId?.address?.street}
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
          </AnimatePresence>
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
                  <div className="font-semibold">{t("order")} {selected.orderId}</div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 rounded hover:bg-slate-100"
                >
                  <X className="text-[#DC3173]" />
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
                    {selected.customerId?.address?.street},{" "}
                    {selected.customerId?.address?.city}
                  </div>

                  <div className="mt-4 text-sm text-slate-500">
                    {t("delivery_partner")}
                  </div>
                  <div className="inline-block px-3 py-1 mt-1 rounded bg-green-100 text-green-800 text-sm">
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
                  <div className="text-sm text-slate-500">{t("delivered_at")}</div>
                  <div className="font-medium">
                    {format(selected.deliveredAt as Date, "yyyy-MM-dd HH:mm")}
                  </div>

                  <div className="mt-4 text-sm text-slate-500">{t("items")}</div>
                  <ul className="mt-2 space-y-2">
                    {selected.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <div>
                          {it.productId?.name} × {it.quantity}
                        </div>
                        <div>€ {(it.price * it.quantity).toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
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
