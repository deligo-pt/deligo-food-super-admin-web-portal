"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, Download, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";


type Order = {
  id: string;
  orderNo: string;
  customerName: string;
  deliveryPartner: string;
  reason: string;
  total: number;
  cancelledAt: string;
  address: string;
  paymentMethod: string;
};

// Mock cancelled orders
const mockOrders: Order[] = Array.from({ length: 37 }).map((_, i) => {
  const partners = ["Glovo", "Uber Eats", "Bolt Food", "Local"];
  const reasons = [
    "Cliente cancelou",
    "Sem entregador disponível",
    "Restaurante atrasado",
    "Pagamento falhou",
    "Entregador cancelou",
  ];
  return {
    id: `CNL-${4000 + i}`,
    orderNo: `#${900 + i}`,
    customerName: ["Rafael", "Inês", "Diogo", "Marta", "Miguel"][(i + 2) % 5],
    deliveryPartner: partners[i % partners.length],
    reason: reasons[i % reasons.length],
    total: Number((8 + i * 1.3).toFixed(2)),
    cancelledAt: new Date(Date.now() - i * 1000 * 60 * 60 * 12).toISOString(),
    address: `Rua ${i + 10}, Lisboa`,
    paymentMethod: i % 2 ? "Card" : "Cash",
  };
});

const fmt = (iso: string) => new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function CancelledOrdersPage() {
  const [query, setQuery] = useState("");
  const [partnerFilter, setPartnerFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [selected, setSelected] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // data (replace with fetch in real app)
  const orders = useMemo(() => mockOrders.slice().reverse(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (partnerFilter && o.deliveryPartner !== partnerFilter) return false;
      if (!q) return true;
      return (
        o.orderNo.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.reason.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q)
      );
    });
  }, [orders, query, partnerFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  // Analytics calculations
  const analytics = useMemo(() => {
    // cancellations by partner
    const byPartner: Record<string, number> = {};
    const byReason: Record<string, number> = {};
    const trendMap: Record<string, number> = {}; // date -> count

    filtered.forEach((o) => {
      byPartner[o.deliveryPartner] = (byPartner[o.deliveryPartner] || 0) + 1;
      byReason[o.reason] = (byReason[o.reason] || 0) + 1;
      const d = new Date(o.cancelledAt);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      trendMap[key] = (trendMap[key] || 0) + 1;
    });

    const partnerSeries = Object.entries(byPartner).map(([k, v]) => ({ name: k, cancellations: v }));
    const reasonSeries = Object.entries(byReason).map(([k, v]) => ({ name: k, value: v }));
    const trendSeries = Object.entries(trendMap).map(([k, v]) => ({ date: k, cancellations: v })).slice(0, 12);

    return { partnerSeries, reasonSeries, trendSeries };
  }, [filtered]);

  const exportCSV = (list: Order[]) => {
    const header = ["orderNo", "id", "customerName", "deliveryPartner", "reason", "total", "cancelledAt", "paymentMethod", "address"];
    const rows = list.map((o) => [o.orderNo, o.id, o.customerName, o.deliveryPartner, o.reason, o.total.toFixed(2), o.cancelledAt, o.paymentMethod, o.address]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cancelled-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // UI
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#DC3173] flex items-center gap-2">
              <AlertTriangle className="text-[#DC3173]" /> Cancelled Orders
            </h1>
            <p className="text-slate-500 text-sm">Encomendas canceladas — monitorize motivos e parceiros para reduzir churn.</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative hidden md:flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm flex-1 lg:flex-none">
              <Search className="text-[#DC3173] mr-2" />
              <input
                placeholder="Search order, customer, reason..."
                className="outline-none w-56 text-sm"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 ml-2">
                  <X />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters((v) => !v)}
              className="border px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#DC317310] transition"
            >
              <Filter className="text-[#DC3173]" /> <span className="hidden sm:inline">Filters</span>
            </button>

            <button onClick={() => exportCSV(filtered)} className="bg-[#DC3173] text-white px-4 py-2 rounded-lg flex gap-2 items-center">
              <Download /> Export
            </button>
          </div>
        </div>

        {/* FILTERS */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
              <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-500">Delivery Partner</label>
                  <select
                    value={partnerFilter ?? ""}
                    onChange={(e) => {
                      setPartnerFilter(e.target.value || null);
                      setPage(1);
                    }}
                    className="border rounded px-3 py-1 text-sm"
                  >
                    <option value="">All</option>
                    <option value="Glovo">Glovo</option>
                    <option value="Uber Eats">Uber Eats</option>
                    <option value="Bolt Food">Bolt Food</option>
                    <option value="Local">Local</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                  <label className="text-sm text-slate-500">Per Page</label>
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

      {/* ANALYTICS + LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Charts */}
        <div className="lg:col-span-1 bg-white border rounded-xl shadow-md p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Cancellation Analytics</h2>

          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.partnerSeries} margin={{ top: 6, right: 8, left: -10, bottom: 6 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="cancellations" radius={[6, 6, 0, 0]} fill="#DC3173" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={analytics.reasonSeries} dataKey="value" nameKey="name" innerRadius={36} outerRadius={64} paddingAngle={6}>
                  {analytics.reasonSeries.map((entry, idx) => (
                    <Cell key={entry.name} fill={["#DC3173", "#ff7aa2", "#ffd1e6", "#f3c4d6", "#f9e6ef"][idx % 5]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={24} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4">
            <h3 className="text-sm text-slate-500">Recent trend</h3>
            <div className="h-28 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.trendSeries} margin={{ left: -20, right: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cancellations" stroke="#DC3173" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Middle & Right: List and details */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
            {/* TABLE (desktop) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="p-3">Order</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Delivery Partner</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Cancelled At</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {pageItems.map((o) => (
                      <motion.tr key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-t hover:bg-[#DC317310] transition cursor-pointer">
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">
                          <div className="font-medium">{o.orderNo}</div>
                          <div className="text-xs text-slate-400">{o.id}</div>
                        </td>
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">{o.customerName}<div className="text-xs text-slate-400">{o.address}</div></td>
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis"><span className="px-3 py-1 rounded-full bg-[#DC317320] text-[#DC3173] text-xs font-medium">{o.deliveryPartner}</span></td>
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">€ {o.total.toFixed(2)}</td>
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">{fmt(o.cancelledAt)}</td>
                        <td className="p-3 align-top text-slate-600 max-w-[240px] overflow-hidden text-ellipsis whitespace-nowrap">{o.reason}</td>
                        <td className="p-3 align-top whitespace-nowrap max-w-[240px] overflow-hidden text-ellipsis">
                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelected(o)} className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition">Details</button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden grid gap-3 overflow-x-auto">
              {pageItems.map((o) => (
                <motion.div key={o.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-[#DC3173]">{o.orderNo}</div>
                      <div className="text-sm text-slate-500">€ {o.total.toFixed(2)}</div>
                      <div className="text-xs text-slate-400 mt-1">{o.customerName} — {o.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">{fmt(o.cancelledAt)}</div>
                      <div className="mt-2"><button onClick={() => setSelected(o)} className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173]">Details</button></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-500">Mostrando {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} de {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-40"><ChevronLeft className="text-[#DC3173]" /></button>
                <div className="text-sm px-3 py-1 border rounded">{page} / {totalPages}</div>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-40"><ChevronRight className="text-[#DC3173]" /></button>
              </div>
            </div>
          </div>

          {/* Quick summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-sm text-slate-500">Total Cancelled</div>
              <div className="text-2xl font-semibold mt-2">{filtered.length}</div>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-sm text-slate-500">Avg Cancellation Value</div>
              <div className="text-2xl font-semibold mt-2">
                € { (filtered.reduce((s, o) => s + o.total, 0) / Math.max(1, filtered.length)).toFixed(2) }
              </div>
            </div>
            <div className="bg-white border rounded-xl p-4 shadow-sm">
              <div className="text-sm text-slate-500">Most common reason</div>
              <div className="text-2xl font-semibold mt-2">{analytics.reasonSeries.sort((a,b)=>b.value-a.value)[0]?.name ?? '-'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Order Details */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.div initial={{ y: 40, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="font-semibold">Order {selected.orderNo}</div>
                  <div className="text-xs text-slate-400">{selected.id}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-slate-100"><X /></button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Customer</div>
                  <div className="font-medium">{selected.customerName}</div>
                  <div className="text-xs text-slate-400 mt-1">{selected.address}</div>

                  <div className="mt-4 text-sm text-slate-500">Delivery Partner</div>
                  <div className="inline-block px-3 py-1 mt-1 rounded bg-[#DC317320] text-[#DC3173] text-sm font-medium">{selected.deliveryPartner}</div>

                  <div className="mt-4 text-sm text-slate-500">Payment (EUR)</div>
                  <div className="font-medium">{selected.paymentMethod} · € {selected.total.toFixed(2)}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">Cancelled At</div>
                  <div className="font-medium">{fmt(selected.cancelledAt)}</div>

                  <div className="mt-4 text-sm text-slate-500">Reason</div>
                  <div className="font-medium text-slate-700">{selected.reason}</div>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-slate-500">Order ID: <span className="text-slate-700">{selected.id}</span></div>
                <div className="flex items-center gap-2">
                  <button onClick={() => exportCSV([selected])} className="px-3 py-2 bg-[#DC3173] text-white rounded">Export</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

     
    </div>
  );
}
