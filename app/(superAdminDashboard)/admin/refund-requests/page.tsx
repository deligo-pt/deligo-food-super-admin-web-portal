"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Filter, Download, RefreshCcw, ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// -----------------------------------------------------------------------------
// SUPER ADMIN — REFUND REQUESTS PAGE (Portugal Optimized)
// Next.js + TypeScript + TailwindCSS + Framer Motion
// Deligo brand color: #DC3173
// -----------------------------------------------------------------------------

type RefundRequest = {
  id: string;
  orderNo: string;
  customerName: string;
  amount: number;
  reason: string;
  requestedAt: string;
  status: "Pending" | "Approved" | "Rejected";
};

// Mock data — replace with API
const mockRefunds: RefundRequest[] = Array.from({ length: 24 }).map((_, i) => {
  const reasons = [
    "Pedido incorreto",
    "Comida fria",
    "Demora excessiva",
    "Entregador rude",
    "Item em falta",
  ];

  return {
    id: `RFD-${3200 + i}`,
    orderNo: `#${700 + i}`,
    customerName: ["Rafael", "Inês", "Marta", "Diogo", "Miguel"][i % 5],
    amount: Number((7 + i * 0.7).toFixed(2)),
    reason: reasons[i % reasons.length],
    requestedAt: new Date(Date.now() - i * 1000 * 60 * 40).toISOString(),
    status: ["Pending", "Approved", "Rejected"][i % 3] as RefundRequest["status"],
  };
});

const fmt = (iso: string) => new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function RefundRequestsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<RefundRequest | null>(null);

  const refunds = useMemo(() => mockRefunds.slice().reverse(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return refunds.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.orderNo.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    });
  }, [refunds, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);

  const exportCSV = (list: RefundRequest[]) => {
    const header = ["orderNo", "customerName", "amount", "reason", "requestedAt", "status"];
    const rows = list.map((r) => [r.orderNo, r.customerName, r.amount.toFixed(2), r.reason, r.requestedAt, r.status]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refund-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // quick stats
  const stats = useMemo(() => {
    const total = filtered.length;
    const pending = filtered.filter((r) => r.status === "Pending").length;
    const approved = filtered.filter((r) => r.status === "Approved").length;
    const rejected = filtered.filter((r) => r.status === "Rejected").length;
    const avg = filtered.length ? (filtered.reduce((s, r) => s + r.amount, 0) / filtered.length) : 0;
    return { total, pending, approved, rejected, avg };
  }, [filtered]);

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-[#DC3173] flex items-center gap-2">
              <ClipboardList className="text-[#DC3173]" /> {t("refund_requests")}
            </h1>
            <p className="text-sm text-slate-600">{t("manage_all_customer_refund_requests")}</p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative hidden md:flex items-center bg-white border rounded-lg px-3 py-1 shadow-sm flex-1 lg:flex-none">
              <Search className="text-[#DC3173] mr-2" />
              <input
                placeholder={t("search_order_customer_reason")}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                className="outline-none text-sm w-56"
              />
              {query && (
                <button onClick={() => setQuery("")} className="ml-2 text-slate-400"><X /></button>
              )}
            </div>

            <button onClick={() => setShowFilters((v) => !v)} className="border px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-[#DC317310] transition">
              <Filter className="text-[#DC3173]" /> <span className="hidden sm:inline">{t("filters")}</span>
            </button>

            <button onClick={() => exportCSV(filtered)} className="bg-[#DC3173] text-white px-4 py-2 rounded-lg flex gap-2 items-center">
              <Download /> {t("export")}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
              <div className="bg-white border rounded-xl p-4 flex flex-col md:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">{t("status")}</label>
                  <select value={statusFilter ?? ""} onChange={(e) => { setStatusFilter(e.target.value || null); setPage(1); }} className="border rounded px-3 py-1 text-sm">
                    <option value="">All</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 md:ml-auto">
                  <label className="text-sm text-slate-600">Per Page</label>
                  <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="border rounded px-3 py-1 text-sm">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-md p-5 hover:shadow-lg transition-all">
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-[1000px] w-full text-sm">
              <thead>
                <tr className="text-left text-slate-600">
                  <th className="p-3 whitespace-nowrap">{t("order")}</th>
                  <th className="p-3 whitespace-nowrap">{t("customer")}</th>
                  <th className="p-3 whitespace-nowrap">{t("amount")}</th>
                  <th className="p-3 whitespace-nowrap">{t("reason")}</th>
                  <th className="p-3 whitespace-nowrap">{t("requested_at")}</th>
                  <th className="p-3 whitespace-nowrap">{t("status")}</th>
                  <th className="p-3 whitespace-nowrap">{t("actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-[#DC317310] transition cursor-pointer">
                    <td className="p-3 whitespace-nowrap align-top">
                      <div className="font-medium">{r.orderNo}</div>
                      <div className="text-xs text-slate-400">{r.id}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap align-top">{r.customerName}</td>
                    <td className="p-3 whitespace-nowrap align-top">€ {r.amount.toFixed(2)}</td>
                    <td className="p-3 max-w-[260px] overflow-hidden text-ellipsis whitespace-nowrap align-top">{r.reason}</td>
                    <td className="p-3 whitespace-nowrap align-top">{fmt(r.requestedAt)}</td>
                    <td className="p-3 whitespace-nowrap align-top">
                      {r.status === "Pending" && <span className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">{t("pending")}</span>}
                      {r.status === "Approved" && <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">{t("approved")}</span>}
                      {r.status === "Rejected" && <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">{t("rejected")}</span>}
                    </td>
                    <td className="p-3 whitespace-nowrap align-top">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(r)} className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173] hover:bg-[#DC3173] hover:text-white transition">{t("details")}</button>
                        <button className="px-3 py-1 rounded border border-slate-200 text-slate-700 hover:bg-slate-50 transition">{t("assign")}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden grid gap-3">
            {pageItems.map((r) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="border rounded-xl p-4 shadow-sm hover:shadow-md transition wrap-break-word">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-[#DC3173]">{r.orderNo}</div>
                    <div className="text-sm text-slate-500">€ {r.amount.toFixed(2)}</div>
                    <div className="text-xs text-slate-400 mt-1">{r.customerName}</div>
                    <div className="text-xs text-slate-400 mt-1">{r.reason}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">{fmt(r.requestedAt)}</div>
                    <div className="mt-2 flex flex-col gap-2">
                      <button onClick={() => setSelected(r)} className="px-3 py-1 rounded border border-[#DC3173] text-[#DC3173]">{t("details")}</button>
                      <button className="px-3 py-1 rounded border border-slate-200 text-slate-700">{t("assign")}</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-slate-500">Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-40"><ChevronLeft className="text-[#DC3173]" /></button>
              <div className="text-sm px-3 py-1 border rounded">{page} / {totalPages}</div>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-40"><ChevronRight className="text-[#DC3173]" /></button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-500">{t("total_requests")}</div>
            <div className="text-2xl font-semibold mt-2">{stats.total}</div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-500">{t("pending")}</div>
            <div className="text-2xl font-semibold mt-2">{stats.pending}</div>
          </div>

          <div className="bg-white border rounded-xl p-4 shadow-sm">
            <div className="text-sm text-slate-500">{t("average_value")}</div>
            <div className="text-2xl font-semibold mt-2">€ {stats.avg.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Modal: Details */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-4 lg:p-8">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
            <motion.div initial={{ y: 40, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="relative bg-white w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t("refund")} {selected.orderNo}</div>
                  <div className="text-xs text-slate-400">{selected.id}</div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 rounded hover:bg-slate-100"><X /></button>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">{t("customer")}</div>
                  <div className="font-medium">{selected.customerName}</div>
                  <div className="mt-4 text-sm text-slate-500">{t("reason")}</div>
                  <div className="text-sm text-slate-700">{selected.reason}</div>
                </div>

                <div>
                  <div className="text-sm text-slate-500">{t("requested_at")}</div>
                  <div className="font-medium">{fmt(selected.requestedAt)}</div>

                  <div className="mt-4 text-sm text-slate-500">{t("amount")}</div>
                  <div className="font-medium">€ {selected.amount.toFixed(2)}</div>

                  <div className="mt-6 flex items-center gap-2">
                    <button onClick={() => { alert('Approve action — wire to API'); }} className="px-4 py-2 bg-green-600 text-white rounded">{t("approve")}</button>
                    <button onClick={() => { alert('Reject action — wire to API'); }} className="px-4 py-2 border rounded">{t("reject")}</button>
                    <button onClick={() => exportCSV([selected])} className="ml-auto px-3 py-2 bg-[#DC3173] text-white rounded">{t("export")}</button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t text-sm text-slate-500">{t("cannot_approve_reject_buttons")}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
