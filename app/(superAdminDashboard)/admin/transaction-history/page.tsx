/* TRANSACTION HISTORY — NEXT-LEVEL, INDUSTRY STANDARD
   Place: pages/admin/transaction-history.tsx
   Tech: Next.js (app/pages), TypeScript, Tailwind CSS, lucide-react
   Features:
   - Top summary cards (balance, inflow, outflow)
   - Advanced filters (date range presets, type, status, partner search)
   - Sortable columns (date, amount, balance)
   - CSV export, responsive table, sticky header
   - Accessible, no-overflow, compact rows
*/

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useEffect, JSX } from "react";
import {
  Search,
  Calendar,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Download,
  Filter,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

// ---------------------- Types ----------------------
type TxRow = {
  id: string;
  date: string; // YYYY-MM-DD
  type: "Payout" | "Order Payment" | "Refund";
  partner: string;
  amount: number;
  balance: number;
  status: "Success" | "Processing" | "Failed";
};

// ---------------------- Sample Data ----------------------
const sampleRows: TxRow[] = Array.from({ length: 26 }).map((_, i) => ({
  id: `TX-${3000 + i}`,
  date: `2025-11-${((i % 28) + 1).toString().padStart(2, "0")}`,
  type: ["Payout", "Order Payment", "Refund"][i % 3] as any,
  partner: [`Vendor ${((i % 8) + 1)}`, `Rider ${((i % 6) + 1)}`][i % 2],
  amount: Math.round((Math.random() * 400 + 10) * 100) / 100,
  balance: Math.round((5000 + Math.random() * 4000) * 100) / 100,
  status: ["Success", "Processing", "Failed"][i % 3] as any,
}));

// ---------------------- Helpers ----------------------
const formatCurrency = (v: number) => `€${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
const toISO = (d: Date) => d.toISOString().slice(0, 10);

// Quick date ranges relative to 'today' (we'll keep static for sample but show presets)
const datePresets = ["Last 7 days", "Last 30 days", "Last 90 days", "Year to date"] as const;

// ---------------------- Component ----------------------
export default function TransactionHistoryPage(): JSX.Element {
  const { t } = useTranslation();
  // Controls
  const [rows] = useState<TxRow[]>(sampleRows);
  const [query, setQuery] = useState("");
  const [preset, setPreset] = useState<typeof datePresets[number]>("Last 30 days");
  const [from, setFrom] = useState<string>(toISO(new Date(new Date().setDate(new Date().getDate() - 30))));
  const [to, setTo] = useState<string>(toISO(new Date()));
  const [typeFilter, setTypeFilter] = useState<"all" | TxRow["type"]>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | TxRow["status"]>("all");
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"date" | "amount" | "balance">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [loading, setLoading] = useState(false);

  // Derived: apply preset to from/to when preset changes
  useEffect(() => {
    const now = new Date();

    Promise.resolve().then(() => {
      if (preset === "Last 7 days") {
        setFrom(toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)));
        setTo(toISO(now));
      } else if (preset === "Last 30 days") {
        setFrom(toISO(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30)));
        setTo(toISO(now));
      }
    });
  }, [preset]);


  // Filtered + sorted
  const filtered = useMemo(() => {
    const f = rows.filter((r) => {
      // date range
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;

      // type/status
      if (typeFilter !== "all" && r.type !== typeFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;

      // query
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.partner.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      );
    });

    // sort
    const sorted = f.sort((a, b) => {
      let val = 0;
      if (sortBy === "date") val = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "amount") val = a.amount - b.amount;
      if (sortBy === "balance") val = a.balance - b.balance;
      return sortDir === "asc" ? val : -val;
    });
    return sorted;
  }, [rows, from, to, query, typeFilter, statusFilter, sortBy, sortDir]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));

  useEffect(() => {
    Promise.resolve().then(() => {
      if (page > totalPages) setPage(1);
    });
  }, [totalPages, page]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);


  // summary values
  const inflow = filtered.filter(r => r.amount > 0 && r.type !== 'Payout').reduce((s, r) => s + r.amount, 0);
  const outflow = filtered.filter(r => r.type === 'Payout').reduce((s, r) => s + r.amount, 0);
  const currentBalance = paginated.length ? paginated[0].balance : filtered[0]?.balance ?? 0;

  // CSV export
  const exportCSV = () => {
    const header = ["id", "date", "type", "partner", "amount", "balance", "status"];
    const csv = [header.join(',')]
      .concat(filtered.map(r => [r.id, r.date, r.type, r.partner, r.amount.toFixed(2), r.balance.toFixed(2), r.status].join(',')))
      .join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  // simulate refresh
  const handleRefresh = () => { setLoading(true); setTimeout(() => setLoading(false), 700); };

  // toggle sort
  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="w-7 h-7 text-[#DC3173]" />
            {t("transaction_history")}
          </h1>
          <p className="text-sm text-gray-500">{t("full_ledger_platform_transactions_payouts")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-white shadow-sm">
            <RefreshCw className="w-4 h-4" /> {t("refresh")}
          </button>

          <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#DC3173] text-white shadow hover:opacity-95">
            <Download className="w-4 h-4" /> {t("export")}
          </button>
        </div>
      </div>

      {/* Top Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{t("current_balance")}</p>
            <p className="text-xl font-semibold">{formatCurrency(currentBalance)}</p>
          </div>
          <div className="p-2 rounded-md bg-[#DC3173]/10">
            <Wallet className="w-6 h-6 text-[#DC3173]" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{t("inflow")}</p>
            <p className="text-xl font-semibold text-green-600">{formatCurrency(inflow)}</p>
          </div>
          <div className="p-2 rounded-md bg-green-50">
            <ArrowUpCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">{t("outflow")}</p>
            <p className="text-xl font-semibold text-red-600">{formatCurrency(outflow)}</p>
          </div>
          <div className="p-2 rounded-md bg-red-50">
            <ArrowDownCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="bg-white p-4 rounded-2xl flex flex-col lg:flex-row flex-wrap gap-3 items-start lg:items-center justify-between border shadow-sm">
        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border">
            <Filter className="w-4 h-4 text-gray-400" />
            <select value={preset} onChange={(e) => setPreset(e.target.value as any)} className="bg-transparent outline-none text-sm">
              {datePresets.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="outline-none text-sm bg-transparent" />
            <span className="px-2 text-gray-300">—</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="outline-none text-sm bg-transparent" />
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)} className="outline-none text-sm bg-transparent">
              <option value="all">{t("all_types")}</option>
              <option value="Payout">{t("payout")}</option>
              <option value="Order Payment">{t("order_payment")}</option>
              <option value="Refund">{t("refund")}</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="outline-none text-sm bg-transparent">
              <option value="all">{t("all_status")}</option>
              <option value="Success">{t("success")}</option>
              <option value="Processing">{t("processing")}</option>
              <option value="Failed">{t("failed")}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <div className="flex items-center bg-white px-3 py-2 rounded-lg border w-full lg:w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search_tx_id_partner_type")} className="ml-2 bg-transparent outline-none text-sm w-full" />
          </div>

          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">{t("rows")}</div>
            <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="px-2 py-1 rounded-md border">
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-white sticky top-0">
              <tr className="text-xs text-gray-500 uppercase border-b">
                <th className="py-3 px-3 text-left">{t("date")}
                  <button onClick={() => toggleSort('date')} className="ml-2 inline-flex items-center text-gray-400">{sortBy === 'date' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-40" />}</button>
                </th>
                <th className="py-3 px-3 text-left">{t("tx_id")}</th>
                <th className="py-3 px-3 text-left">{t("type")}</th>
                <th className="py-3 px-3 text-left">{t("partner")}</th>
                <th className="py-3 px-3 text-left">{t("amount")}
                  <button onClick={() => toggleSort('amount')} className="ml-2 inline-flex items-center text-gray-400">{sortBy === 'amount' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-40" />}</button>
                </th>
                <th className="py-3 px-3 text-left">{t("balance")}
                  <button onClick={() => toggleSort('balance')} className="ml-2 inline-flex items-center text-gray-400">{sortBy === 'balance' ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <ChevronDown className="w-3 h-3 opacity-40" />}</button>
                </th>
                <th className="py-3 px-3 text-left">{t("status")}</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium text-gray-800">{r.id}</td>
                  <td className="py-3 px-3 whitespace-nowrap flex items-center gap-2 text-sm text-gray-700">
                    {r.type === 'Payout' && <ArrowDownCircle className="w-4 h-4 text-blue-600" />}
                    {r.type === 'Order Payment' && <ArrowUpCircle className="w-4 h-4 text-green-600" />}
                    {r.type === 'Refund' && <ArrowDownCircle className="w-4 h-4 text-yellow-600" />}
                    {r.type}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.partner}</td>
                  <td className={`py-3 px-3 whitespace-nowrap font-semibold ${r.type === 'Payout' ? 'text-red-600' : 'text-green-700'}`}>{formatCurrency(r.amount)}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-[#DC3173] font-medium">{formatCurrency(r.balance)}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'Success' ? 'bg-green-100 text-green-800' : r.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
                  </td>
                </tr>
              ))}

              {paginated.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">{t("no_transactions_match_filters")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t">
          <div className="text-sm text-gray-600">{t("showing")} <span className="font-medium">{filtered.length}</span> {t("transactions")}</div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 rounded-md border">Prev</button>
            <div className="px-3 py-1 border rounded-md text-sm">{page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 rounded-md border">Next</button>
          </div>
        </div>
      </div>

      {/* small helpers */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
