/* eslint-disable @typescript-eslint/no-explicit-any */


"use client";

import { JSX, useEffect, useMemo, useState } from "react";
import {
  ReceiptCent,
  Plus,
  Edit,
  Search,
  Download,
  X,
  Trash,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "@/hooks/use-translation";

// ---------------------- Types ----------------------
type TaxRule = {
  id: string;
  region: string;
  rate: number; // percent
  effectiveFrom: string; // YYYY-MM-DD
  status: "Active" | "Inactive";
  createdAt?: string;
  updatedAt?: string;
};

type Tx = {
  id: string;
  date: string; // YYYY-MM-DD
  vendor: string;
  region: string;
  taxable: number;
  vat: number;
};

// ---------------------- Small helpers ----------------------
const formatCurrency = (v: number) => `€${v.toFixed(2)}`;
const toISO = (d: Date) => d.toISOString().slice(0, 10);

function useDebounced<T>(value: T, ms = 300) {
  const [state, setState] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setState(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return state;
}

// ---------------------- Demo data (replace with server data) ----------------------
const demoRules: TaxRule[] = [
  { id: "TR-1", region: "Lisbon", rate: 23, effectiveFrom: "2024-01-01", status: "Active", createdAt: "2024-01-01" },
  { id: "TR-2", region: "Porto", rate: 23, effectiveFrom: "2024-01-01", status: "Active", createdAt: "2024-01-01" },
  { id: "TR-3", region: "Faro", rate: 6, effectiveFrom: "2024-02-01", status: "Inactive", createdAt: "2024-02-01" },
];


const demoTx: Tx[] = Array.from({ length: 36 }).map((_, i) => ({
  id: `TX-${5000 + i}`,
  date: `2025-11-${((i % 28) + 1).toString().padStart(2, "0")}`,
  vendor: `Vendor ${((i % 8) + 1)}`,
  region: ["Lisbon", "Porto", "Faro", "Coimbra"][i % 4],
  taxable: Math.round((Math.random() * 120 + 20) * 100) / 100,
  vat: Math.round((Math.random() * 26 + 5) * 100) / 100,
}));

// ---------------------- Fetch wrapper placeholders (swap with real endpoints) ----------------------
async function apiGetRules(): Promise<TaxRule[]> {
  // replace with: return fetch('/api/tax/rules').then(r=>r.json())
  return new Promise((res) => setTimeout(() => res(demoRules), 350));
}
async function apiGetTxs(): Promise<Tx[]> {
  return new Promise((res) => setTimeout(() => res(demoTx), 350));
}
async function apiSaveRule(rule: TaxRule): Promise<TaxRule> {
  // replace with POST/PATCH request
  return new Promise((res) => setTimeout(() => res({ ...rule, updatedAt: new Date().toISOString() }), 400));
}
async function apiBulkUpdate(ids: string[], data: Partial<TaxRule>): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), 500));
}
async function apiDeleteRule(id: string): Promise<void> {
  return new Promise((res) => setTimeout(() => res(), 400));
}

// ---------------------- Main component ----------------------
export default function TaxManagementPage(): JSX.Element {
  const { t } = useTranslation();
  // server-backed state
  const [rules, setRules] = useState<TaxRule[]>([]);
  const [txRows, setTxRows] = useState<Tx[]>([]);

  // UI state
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounced(query, 300);
  const [sortBy, setSortBy] = useState<"date" | "taxable" | "vat">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // rule modal + edit
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TaxRule | null>(null);

  // bulk select
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // audit log panel
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditEntries, setAuditEntries] = useState<string[]>([]);

  // loading & toast
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const [r, t] = await Promise.all([apiGetRules(), apiGetTxs()]);
      if (!mounted) return;
      setRules(r);
      setTxRows(t);
      setLoading(false);
    }
    load();
    return () => { mounted = false; };
  }, []);

  // filtered txs for report
  const filteredTx = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    const f = txRows.filter((t) => t.id.toLowerCase().includes(q) || t.vendor.toLowerCase().includes(q) || t.region.toLowerCase().includes(q));
    const sorted = [...f].sort((a, b) => {
      let v = 0;
      if (sortBy === "date") v = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === "taxable") v = a.taxable - b.taxable;
      if (sortBy === "vat") v = a.vat - b.vat;
      return sortDir === "asc" ? v : -v;
    });
    return sorted;
  }, [txRows, debouncedQuery, sortBy, sortDir]);

  const total = filteredTx.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (page > totalPages) setPage(1);
  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredTx.slice(start, start + perPage);
  }, [filteredTx, page, perPage]);

  const vatCollected = txRows.reduce((s, t) => s + t.vat, 0);
  const taxableTotal = txRows.reduce((s, t) => s + t.taxable, 0);

  // VAT trend (simple aggregation by day)
  const vatTrend = useMemo(() => {
    const map: Record<string, number> = {};
    txRows.forEach((t) => { map[t.date] = (map[t.date] || 0) + t.vat; });
    return Object.keys(map).sort().map((k) => ({ date: k, vat: map[k] }));
  }, [txRows]);

  // actions
  const openAdd = () => { setEditingRule(null); setIsRuleModalOpen(true); };
  const openEdit = (r: TaxRule) => { setEditingRule(r); setIsRuleModalOpen(true); };

  const saveRule = async (r: TaxRule) => {
    setLoading(true);
    try {
      const saved = await apiSaveRule(r);
      setRules((prev) => {
        const exists = prev.find((p) => p.id === saved.id);
        if (exists) return prev.map((p) => (p.id === saved.id ? saved : p));
        return [saved, ...prev];
      });
      setToast('Rule saved');
      setAuditEntries((a) => [`Saved rule ${saved.id} @ ${new Date().toISOString()}`, ...a]);
    } catch (err) {
      setToast('Failed to save rule');
    } finally { setLoading(false); setIsRuleModalOpen(false); }
  };

  const bulkActivate = async () => {
    if (!selectedIds.length) { setToast('No rules selected'); return; }
    setLoading(true);
    try {
      await apiBulkUpdate(selectedIds, { status: 'Active' });
      setRules((prev) => prev.map((r) => selectedIds.includes(r.id) ? { ...r, status: 'Active' } : r));
      setToast('Activated selected rules');
      setAuditEntries((a) => [`Activated ${selectedIds.length} rules @ ${new Date().toISOString()}`, ...a]);
      setSelectedIds([]);
    } catch (err) { setToast('Bulk update failed'); }
    finally { setLoading(false); }
  };

  const bulkDeactivate = async () => {
    if (!selectedIds.length) { setToast('No rules selected'); return; }
    setLoading(true);
    try {
      await apiBulkUpdate(selectedIds, { status: 'Inactive' });
      setRules((prev) => prev.map((r) => selectedIds.includes(r.id) ? { ...r, status: 'Inactive' } : r));
      setToast('Deactivated selected rules');
      setAuditEntries((a) => [`Deactivated ${selectedIds.length} rules @ ${new Date().toISOString()}`, ...a]);
      setSelectedIds([]);
    } catch (err) { setToast('Bulk update failed'); }
    finally { setLoading(false); }
  };

  const removeRule = async (id: string) => {
    if (!confirm('Delete rule?')) return;
    setLoading(true);
    try {
      await apiDeleteRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      setToast('Rule deleted');
      setAuditEntries((a) => [`Deleted rule ${id} @ ${new Date().toISOString()}`, ...a]);
    } catch (err) { setToast('Delete failed'); }
    finally { setLoading(false); }
  };

  const exportCSV = () => {
    const header = ['id', 'date', 'vendor', 'region', 'taxable', 'vat'];
    const csv = [header.join(',')].concat(filteredTx.map(t => [t.id, t.date, t.vendor, t.region, t.taxable.toFixed(2), t.vat.toFixed(2)].join(','))).join('');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `vat-report-${toISO(new Date())}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ReceiptCent className="w-8 h-8 text-[#DC3173]" /> {t("tax_management")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{t("vat_rules_reports_audit_logs")}</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="inline-flex items-center gap-2 bg-[#DC3173] text-white px-4 py-2 rounded-xl shadow">
            <Download className="w-4 h-4" /> {t("export_csv")}
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-white border px-4 py-2 rounded-xl">
            <Plus className="w-4 h-4" /> {t("new_rule")}
          </button>
        </div>
      </div>

      {/* Top row: summary + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 shadow-sm border flex flex-col gap-3 overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">{t("vat_collected_period")}</p>
              <h3 className="text-2xl font-semibold">{formatCurrency(vatCollected)}</h3>
            </div>
            <div className="text-sm text-gray-500">{t("taxable_total")}: {formatCurrency(taxableTotal)}</div>
          </div>

          <div className="mt-4 h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vatTrend}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.06} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vat" stroke="#DC3173" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border">
          <h4 className="text-sm text-gray-500">{t("rules")}</h4>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">{t("active_rules")}</div>
              <div className="font-semibold">{rules.filter(r => r.status === 'Active').length}</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">{t("regions")}</div>
              <div className="font-semibold">{rules.length}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={bulkActivate} className="px-3 py-2 rounded-md bg-green-50 text-green-800 text-sm">{t("activate")}</button>
              <button onClick={bulkDeactivate} className="px-3 py-2 rounded-md bg-yellow-50 text-yellow-800 text-sm">{t("deactivate")}</button>
              <button onClick={() => setAuditOpen(v => !v)} className="px-3 py-2 rounded-md border text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> {t("audit")}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Rules manager */}
      <section className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">{t("tax_rules")}</h2>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">{t("selected")} {selectedIds.length}</div>
            <button onClick={() => setSelectedIds([])} className="px-3 py-1 border rounded-md">{t("clear")}</button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="py-3 px-3 text-left w-12"><input aria-label="select all" type="checkbox" onChange={(e) => {
                  if (e.target.checked) setSelectedIds(rules.map(r => r.id)); else setSelectedIds([]);
                }} /></th>
                <th className="py-3 px-3 text-left">{t("region")}</th>
                <th className="py-3 px-3 text-left">{t("tax")} %</th>
                <th className="py-3 px-3 text-left">{t("effective_from")}</th>
                <th className="py-3 px-3 text-left">{t("status")}</th>
                <th className="py-3 px-3 text-left">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 whitespace-nowrap"><input aria-label={`select ${r.id}`} type="checkbox" checked={selectedIds.includes(r.id)} onChange={(e) => {
                    setSelectedIds(prev => e.target.checked ? [...prev, r.id] : prev.filter(x => x !== r.id));
                  }} /></td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium">{r.region}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.rate}%</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.effectiveFrom}</td>
                  <td className="py-3 px-3 whitespace-nowrap"><span className={`px-3 py-1 rounded-full text-xs font-medium ${r.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>{r.status}</span></td>
                  <td className="py-3 px-3 whitespace-nowrap flex items-center gap-2">
                    <button onClick={() => openEdit(r)} className="px-3 py-1 rounded-md border inline-flex items-center gap-2"><Edit className="w-4 h-4" /> {t("edit")}</button>
                    <button onClick={() => removeRule(r.id)} className="px-3 py-1 rounded-md border text-red-600 inline-flex items-center gap-2"><Trash className="w-4 h-4" /> {t("delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* VAT Payout Report */}
      <section className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 mb-4">
          <h2 className="text-xl font-semibold">{t("vat_payout_report")}</h2>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="flex items-center bg-white px-3 py-2 rounded-lg border w-full lg:w-72">
              <Search className="w-4 h-4 text-gray-400" />
              <input aria-label="search transactions" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("search_transaction_vendor_region")} className="ml-2 bg-transparent outline-none text-sm w-full" />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-500">{t("rows")}</label>
              <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))} className="px-2 py-1 rounded-md border">
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-3 py-2 rounded-md border">{t("export")}</button>
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500 uppercase">
                <th className="py-3 px-3 text-left">{t("date")}</th>
                <th className="py-3 px-3 text-left">{t("transaction")}</th>
                <th className="py-3 px-3 text-left">{t("vendor")}</th>
                <th className="py-3 px-3 text-left">{t("region")}</th>
                <th className="py-3 px-3 text-left">{t("taxable")} (€)</th>
                <th className="py-3 px-3 text-left">{t("vat")} (€)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 whitespace-nowrap">{t.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap font-medium">{t.id}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{t.vendor}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{t.region}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{formatCurrency(t.taxable)}</td>
                  <td className="py-3 px-3 whitespace-nowrap text-[#DC3173] font-semibold">{formatCurrency(t.vat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-600">{t("showing")} <span className="font-medium">{total}</span> {t("transactions")}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-1 border rounded-md">Prev</button>
            <div className="px-3 py-1 border rounded-md text-sm">{page} / {totalPages}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="px-3 py-1 border rounded-md">Next</button>
          </div>
        </div>
      </section>

      {/* Rule Modal */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsRuleModalOpen(false)} />
          <div className="bg-white rounded-2xl p-6 z-60 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{editingRule ? 'Edit Rule' : 'New Tax Rule'}</h3>
              <button onClick={() => setIsRuleModalOpen(false)} className="p-2 rounded-md border"><X className="w-4 h-4" /></button>
            </div>
            <RuleForm rule={editingRule} onCancel={() => setIsRuleModalOpen(false)} onSave={saveRule} />
          </div>
        </div>
      )}

      {/* Audit drawer */}
      {auditOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1" onClick={() => setAuditOpen(false)} aria-hidden />
          <aside className="w-full sm:w-96 bg-white p-6 overflow-auto border-l shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">{t("audit_log")}</h3>
              <button onClick={() => setAuditOpen(false)} className="p-2 rounded-md border"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              {auditEntries.length === 0 ? <div className="text-gray-400">{t("no_audit_entries")}</div> : auditEntries.map((a, i) => (<div key={i} className="p-2 bg-gray-50 rounded-md">{a}</div>))}
            </div>
          </aside>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 bg-gray-900 text-white px-4 py-2 rounded-md shadow">{toast} <button className="ml-3 text-xs underline" onClick={() => setToast(null)}>{t("dismiss")}</button></div>
      )}

      <style jsx>{` .no-scrollbar::-webkit-scrollbar { display: none; } `}</style>
    </div>
  );
}

// ---------------------- Rule Form Component ----------------------
function RuleForm({ rule, onCancel, onSave }: { rule: TaxRule | null; onCancel: () => void; onSave: (r: TaxRule) => void }) {
  const { t } = useTranslation();
  const [region, setRegion] = useState(rule?.region ?? "");
  const [rate, setRate] = useState<number>(rule?.rate ?? 23);
  const [effectiveFrom, setEffectiveFrom] = useState(rule?.effectiveFrom ?? toISO(new Date()));
  const [status, setStatus] = useState<TaxRule["status"]>(rule?.status ?? "Active");

  useEffect(() => { if (rule) { setRegion(rule.region); setRate(rule.rate); setEffectiveFrom(rule.effectiveFrom); setStatus(rule.status); } }, [rule]);

  const handleSave = () => {
    const r: TaxRule = { id: rule?.id ?? `TR-${Math.floor(Math.random() * 10000)}`, region: region || 'Region', rate, effectiveFrom, status };
    onSave(r);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500">{t("region")}</label>
        <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full px-3 py-2 border rounded-md mt-1" />
      </div>

      <div>
        <label className="text-xs text-gray-500">{t("tax_rate")} (%)</label>
        <input type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} className="w-full px-3 py-2 border rounded-md mt-1" />
      </div>

      <div>
        <label className="text-xs text-gray-500">{t("effective_from")}</label>
        <input type="date" value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} className="w-full px-3 py-2 border rounded-md mt-1" />
      </div>

      <div>
        <label className="text-xs text-gray-500">{t("status")}</label>
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full px-3 py-2 border rounded-md mt-1">
          <option value="Active">{t("active")}</option>
          <option value="Inactive">{t("inactive")}</option>
        </select>
      </div>

      <div className="flex items-center justify-end gap-2 mt-4">
        <button onClick={onCancel} className="px-4 py-2 rounded-md border">{t("cancel")}</button>
        <button onClick={handleSave} className="px-4 py-2 rounded-md bg-[#DC3173] text-white">{t("save")}</button>
      </div>
    </div>
  );
}
