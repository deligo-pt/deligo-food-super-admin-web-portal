/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useMemo, useState } from "react";
import {
  Search,
  Download,
  MapPin,
  Cpu,
  Smartphone,
  Globe,

  CheckCircle,
  XCircle,
  Trash2,

  ToggleLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "@/hooks/use-translation";

type LoginRecord = {
  id: string;
  admin: string;
  email: string;
  ip: string;
  city?: string;
  country?: string;
  device: string;
  browser: string;
  os: string;
  status: "success" | "failed";
  timestamp: string; // ISO
  durationSec?: number; // session duration in seconds
  sessionId?: string;
  action?: string;
};

const mock: LoginRecord[] = [
  { id: "lh1", admin: "Mariana Silva", email: "mariana@deligo.pt", ip: "185.12.45.3", city: "Lisbon", country: "PT", device: "Desktop", browser: "Chrome", os: "Windows", status: "success", timestamp: "2025-11-21T19:12:00", durationSec: 3600, sessionId: "s_abc123" },
  { id: "lh2", admin: "Tiago Fernandes", email: "tiago@deligo.pt", ip: "185.12.45.99", city: "Porto", country: "PT", device: "Mobile", browser: "Safari", os: "iOS", status: "failed", timestamp: "2025-11-21T18:50:00", durationSec: 0, sessionId: "s_def456" },
  { id: "lh3", admin: "Rita Gomes", email: "rita@deligo.pt", ip: "91.121.3.11", city: "Faro", country: "PT", device: "Desktop", browser: "Firefox", os: "macOS", status: "success", timestamp: "2025-11-20T12:05:00", durationSec: 5400, sessionId: "s_ghi789" },
  { id: "lh4", admin: "João Pereira", email: "joao@deligo.pt", ip: "91.121.3.22", city: "Coimbra", country: "PT", device: "Desktop", browser: "Chrome", os: "Linux", status: "success", timestamp: "2025-11-19T09:15:00", durationSec: 1800, sessionId: "s_jkl012" },
  { id: "lh5", admin: "Inês Costa", email: "ines@deligo.pt", ip: "185.12.45.110", city: "Lisbon", country: "PT", device: "Mobile", browser: "Chrome", os: "Android", status: "failed", timestamp: "2025-11-18T22:40:00", durationSec: 0, sessionId: "s_mno345" },
];

const fmt = (iso: string) => new Date(iso).toLocaleString();
const secToH = (s?: number) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}h ${m}m`;
};

export default function LoginHistoryPage() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<LoginRecord[]>(mock);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed">("all");
  const [page, setPage] = useState(1);
  const perPage = 8;
  const [timeline, setTimeline] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter(r => {
      const matchQ = !q || r.admin.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.ip.includes(q) || (r.city && r.city.toLowerCase().includes(q));
      const matchStatus = filterStatus === "all" || r.status === filterStatus;
      return matchQ && matchStatus;
    }).sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
  }, [records, query, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice((page - 1) * perPage, page * perPage);

  const revokeSession = (id: string) => {
    if (!confirm('Revoke session for this login?')) return;
    // In production: call API to revoke using sessionId
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const exportCSV = () => {
    const rows = [
      ["admin", "email", "ip", "city", "country", "device", "browser", "os", "status", "timestamp", "durationSec"],
      ...filtered.map(r => [r.admin, r.email, r.ip, r.city || "", r.country || "", r.device, r.browser, r.os, r.status, r.timestamp, String(r.durationSec || 0)]),
    ];
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `login-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-6 lg:p-10 bg-linear-to-b from-white via-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{t("login_history")}</h1>
            <p className="mt-1 text-sm text-gray-600">{t("see_recent_sign_ins_failed_attempts")}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border rounded-full px-3 py-2 shadow-sm">
              <Search className="text-gray-400" />
              <input value={query} onChange={e => { setQuery(e.target.value); setPage(1); }} placeholder="Search by admin, email, ip, city..." className="ml-2 outline-none w-72" />
            </div>

            <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value as any); setPage(1); }} className="px-3 py-2 border rounded-lg bg-white shadow-sm">
              <option value="all">{t("all")}</option>
              <option value="success">{t("success")}</option>
              <option value="failed">{t("failed")}</option>
            </select>

            <button onClick={exportCSV} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#DC3173] text-white shadow hover:brightness-95">
              <Download size={16} /> {t("export")}
            </button>

            <button onClick={() => setTimeline(t => !t)} className="inline-flex items-center gap-2 px-3 py-2 rounded-full border bg-white">
              <ToggleLeft size={16} /> {timeline ? t("timeline") : t("list")}
            </button>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl shadow-lg border overflow-hidden">

          {timeline ? (
            <div className="p-6">
              <div className="space-y-6">
                {visible.map((r, i) => (
                  <motion.div key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="flex gap-4 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${r.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div className="w-px h-full bg-gray-100 mt-2" />
                    </div>

                    <div className="flex-1 bg-gray-50 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{r.admin} <span className="ml-2 text-xs text-gray-400">{r.email}</span></div>
                          <div className="text-sm text-gray-600 mt-1">{r.action ?? `${r.status === 'success' ? 'Signed in' : 'Failed login attempt'}`}</div>
                        </div>

                        <div className="text-sm text-gray-500 text-right">
                          <div>{fmt(r.timestamp)}</div>
                          <div className="mt-1 text-xs">{r.city ? `${r.city}, ${r.country}` : r.ip}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3 flex-wrap">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm">
                          <Smartphone size={14} /> {r.device}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm">
                          <Cpu size={14} /> {r.os}
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border text-sm">
                          <Globe size={14} /> {r.browser}
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                          <button onClick={() => revokeSession(r.id)} className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-50 text-red-700 border">
                            <Trash2 size={14} /> {t("revoke")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {visible.length === 0 && <div className="text-center text-gray-500 py-8">{t("no_login_records_found")}</div>}

                {/* pagination */}
                <div className="pt-4 flex items-center justify-center">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-md border mr-2">Prev</button>
                  <div className="px-3 py-1 rounded-md bg-gray-50 border">{page} / {totalPages}</div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-md border ml-2">Next</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-left">{t('admin')}</th>
                    <th className="p-3 text-left">{t("ip_location")}</th>
                    <th className="p-3 text-left">{t("device")}</th>
                    <th className="p-3 text-left">{t("browser_os")}</th>
                    <th className="p-3 text-left">{t("time")}</th>
                    <th className="p-3 text-left">{t("status")}</th>
                    <th className="p-3 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r, i) => (
                    <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{r.admin}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2"><MapPin size={14} /> {r.ip}{r.city ? ` — ${r.city}, ${r.country}` : ''}</div>
                      </td>
                      <td className="p-3">{r.device}</td>
                      <td className="p-3">{r.browser} / {r.os}</td>
                      <td className="p-3">{fmt(r.timestamp)} <div className="text-xs text-gray-400">{secToH(r.durationSec)}</div></td>
                      <td className="p-3">
                        {r.status === 'success' ? <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-green-50 text-green-700"><CheckCircle size={14} /> {t("success")}</span> : <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-red-50 text-red-700"><XCircle size={14} /> {t("failed")}</span>}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => revokeSession(r.id)} className="px-3 py-1 rounded-md border text-red-600">{t("revoke")}</button>
                          <button onClick={() => alert('Show more details - implement modal')} className="px-3 py-1 rounded-md bg-[#DC3173] text-white">{t("details")}</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}

                  {visible.length === 0 && <tr><td colSpan={7} className="text-center p-8 text-gray-500">{t("no_login_records_found")}</td></tr>}
                </tbody>
              </table>

              {/* pagination strip */}
              <div className="p-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-600">{t('showing')} {(page - 1) * perPage + 1} - {Math.min(page * perPage, filtered.length)} {t("of")} {filtered.length}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded-md border">Prev</button>
                  <div className="px-3 py-1 rounded-md bg-gray-50 border">{page} / {totalPages}</div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 rounded-md border">Next</button>
                </div>
              </div>
            </div>
          )}

        </motion.div>

      </div>
    </div>
  );
}
