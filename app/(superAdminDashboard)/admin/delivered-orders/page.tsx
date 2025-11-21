"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ChevronLeft, ChevronRight, X, Filter } from "lucide-react";

// -----------------------------------------------------------------------------
// Super Admin — Delivered Orders Page
// Single-file React + TypeScript component for Next.js + TailwindCSS
// - Responsive (table on wide screens, cards on mobile)
// - Animated (Framer Motion) transitions
// - Search, filter, pagination, CSV export, order details modal
// - Mock data included — replace with real API fetch
// -----------------------------------------------------------------------------

type Order = {
  id: string;
  orderNo: string;
  customerName: string;
  deliveryPartner: string;
  items: { name: string; qty: number; price: number }[];
  total: number;
  deliveredAt: string; // ISO date
  address: string;
  paymentMethod:  "Card" | "Wallet";
};

const mockOrders: Order[] = Array.from({ length: 42 }).map((_, i) => {
  const id = `ORD-${202500 + i}`;
  const qty = (i % 5) + 1;
  const items = [
    { name: `Burger ${i % 6}`, qty, price: 120 + (i % 10) * 5 },
    ...(i % 3 === 0 ? [{ name: `Fries`, qty: 1, price: 40 }] : []),
  ];
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  return {
    id,
    orderNo: `#${1000 + i}`,
    customerName: [`Rahim`, `Karim`, `Sadia`, `Anika`, `Tuhin`][i % 5],
    deliveryPartner: [`Glovo`, `InDrive`, `Local`][i % 3],
    items,
    total,
    deliveredAt: new Date(Date.now() - i * 1000 * 60 * 60 * 6).toISOString(),
    address: `House ${i + 1}, Road ${(i % 12) + 1}, City`,
    paymentMethod: i % 2 ? "Card" : "Wallet",
  };
});

// Utility: format date
const fmt = (iso: string) => new Date(iso).toLocaleString();

export default function DeliveredOrdersPage() {
  const [query, setQuery] = useState("");
  const [deliveryPartnerFilter, setDeliveryPartnerFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Replace mockOrders with data fetched from API in real project
  const orders = useMemo(() => mockOrders.slice().reverse(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (deliveryPartnerFilter && o.deliveryPartner !== deliveryPartnerFilter) return false;
      if (!q) return true;
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    });
  }, [orders, query, deliveryPartnerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // CSV export (basic)
  const exportCSV = (list: Order[]) => {
    const header = ["orderNo", "id", "customerName", "deliveryPartner", "total", "deliveredAt", "paymentMethod", "address"];
    const rows = list.map((o) => [o.orderNo, o.id, o.customerName, o.deliveryPartner, o.total.toString(), o.deliveredAt, o.paymentMethod, o.address]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivered-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Responsive render: table for lg+, cards for sm
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#DC3173]">Delivered Orders (Portugal)</h1>
            <p className="text-sm text-slate-400">Gestão profissional das encomendas entregues — otimizado para Portugal.</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden sm:flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm">
              <Search className="text-[#DC3173]" className="text-slate-400 mr-2" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by order#, customer, address"
                className="outline-none w-56 text-sm"
              />
              {query && (
                <button className="ml-2 text-slate-400" onClick={() => setQuery("")}>
                  <X className="text-[#DC3173]" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-2 border px-3 py-2 rounded-lg hover:shadow-md transition"
            >
              <Filter className="text-[#DC3173]" /> <span className="hidden sm:inline">Filters</span>
            </button>

            <button
              onClick={() => exportCSV(filtered)}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-3 py-2 rounded-lg hover:opacity-95 transition"
            >
              <Download className="text-[#DC3173]" /> Export
            </button>
          </div>
        </div>

        {/* Filters area */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 overflow-hidden"
            >
              <div className="bg-white border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 mr-2">Delivery Partner</label>
                  <select
                    value={deliveryPartnerFilter ?? ""}
                    onChange={(e) => {
                      setDeliveryPartnerFilter(e.target.value || null);
                      setPage(1);
                    }}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="Glovo">Glovo</option>
                    <option value="InDrive">InDrive</option>
                    <option value="Local">Local</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 ml-auto">
                  <label className="text-sm text-slate-600">Per page</label>
                  <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="border rounded px-3 py-1 text-sm">
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Content area */}
      <div className="bg-white border rounded-xl shadow-md p-5 transition-all hover:shadow-lg">
        {/* Desktop Table */}
        <div className="hidden lg:block">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="text-left text-slate-500">
                <th className="p-3">Order</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Delivery Partner</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Delivered At</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {pageItems.map((o) => (
                  <motion.tr
                    key={o.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="border-t hover:bg-[#DC317310] transition-all cursor-default"
                  >
                    <td className="p-3 align-top">
                      <div className="font-medium">{o.orderNo}</div>
                      <div className="text-xs text-slate-400">{o.id}</div>
                    </td>
                    <td className="p-3 align-top">
                      <div>{o.customerName}</div>
                      <div className="text-xs text-slate-400">{o.address}</div>
                    </td>
                    <td className="p-3 align-top">
                      <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#DC317320] text-[#DC3173] font-medium">Delivery Partner: {o.deliveryPartner}</span>
                    </td>
                    <td className="p-3 align-top">€ {o.total.toFixed(2)}</td>
                    <td className="p-3 align-top">{fmt(o.deliveredAt)}</td>
                    <td className="p-3 align-top">{o.paymentMethod}</td>
                    <td className="p-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected(o)}
                          className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition-all text-sm"
                        >
                          Details
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden grid grid-cols-1 gap-3">
          <AnimatePresence>
            {pageItems.map((o) => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{o.orderNo} <span className="text-xs text-slate-400">{o.id}</span></div>
                    <div className="text-sm text-slate-500">{o.customerName} · € {o.total.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{fmt(o.deliveredAt)}</div>
                    <div className="mt-2">
                      <button onClick={() => setSelected(o)} className="px-3 py-1 rounded border text-sm">Details</button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500">{o.address}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronLeft className="text-[#DC3173]" />
            </button>
            <div className="text-sm px-3 py-1 border rounded">{page} / {totalPages}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-40"
            >
              <ChevronRight className="text-[#DC3173]" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Order Details */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 lg:p-8"
          >
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />

            <motion.div
              initial={{ y: 40, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden"
            >
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="font-semibold">Order {selected.orderNo}</div>
                  <div className="text-xs text-slate-400">{selected.id}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-slate-100">
                  <X className="text-[#DC3173]" />
                </button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Customer</div>
                  <div className="font-medium">{selected.customerName}</div>
                  <div className="text-xs text-slate-400 mt-1">{selected.address}</div>

                  <div className="mt-4 text-sm text-slate-500">Delivery Partner</div>
                  <div className="inline-block px-3 py-1 mt-1 rounded bg-green-100 text-green-800 text-sm">{selected.deliveryPartner}</div>

                  <div className="mt-4 text-sm text-slate-500">Payment (EUR)</div>
                  <div className="font-medium">{selected.paymentMethod} · € {selected.total}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Delivered At</div>
                  <div className="font-medium">{fmt(selected.deliveredAt)}</div>

                  <div className="mt-4 text-sm text-slate-500">Items</div>
                  <ul className="mt-2 space-y-2">
                    {selected.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <div>{it.name} × {it.qty}</div>
                        <div>€ {(it.price * it.qty).toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-slate-500">Order ID: <span className="text-slate-700">{selected.id}</span></div>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-2 border rounded">Print</button>
                  <button onClick={() => { exportCSV([selected]); }} className="px-3 py-2 bg-[#DC3173] text-white rounded hover:opacity-90 transition">Export</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    
    </div>
  );
}
