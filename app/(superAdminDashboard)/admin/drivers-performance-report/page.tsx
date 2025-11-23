/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState, useCallback, useEffect, JSX } from "react";
import { motion } from "framer-motion";
import {
  Truck,
  Search,
  DownloadCloud,
  ChevronLeft,
  ChevronRight,
  
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart as ReBarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Drivers Performance Report - White background version (single-file)
 * - TailwindCSS classes used for styling
 * - Recharts for charts
 * - framer-motion for small animations (leaderboard bars)
 *
 * Replace SAMPLE_DRIVERS with your API for production.
 */

// ----------------- CONFIG / COLORS -----------------
const PRIMARY = "#DC3173"; // Deligo primary
const ACCENT = "#9333EA";
const ISSUE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6", "#9ca3af"];

// ----------------- SAMPLE DATA (DEV) -----------------
type Driver = {
  id: string;
  name: string;
  deliveries: number;
  acceptRate: number;
  avgDeliveryMin: number;
  rating: number;
  lateDeliveries: number;
  zone: string;
};

const SAMPLE_DRIVERS: Driver[] = Array.from({ length: 12 }).map((_, i) => {
  const names = [
    "Miguel",
    "Sofia",
    "Rui",
    "Ines",
    "Joao",
    "Catarina",
    "Paulo",
    "Ana",
    "Luis",
    "Mariana",
    "Tiago",
    "Beatriz",
  ];
  return {
    id: `DR-${100 + i}`,
    name: names[i % names.length],
    deliveries: 20 + Math.floor(Math.random() * 80),
    acceptRate: 70 + Math.floor(Math.random() * 30),
    avgDeliveryMin: +(15 + Math.random() * 25).toFixed(1),
    rating: +(3.5 + Math.random() * 1.5).toFixed(2),
    lateDeliveries: Math.floor(Math.random() * 6),
    zone: ["Lisbon", "Porto", "Coimbra", "Faro"][i % 4],
  } as Driver;
});

// Delivery trend (last 10 days)
const DELIVERY_TREND = Array.from({ length: 10 }).map((_, i) => {
  const day = 24 - (10 - i);
  return { date: `Nov ${day}`, avgMin: +(12 + Math.random() * 15).toFixed(1) };
});

// Issue breakdown
const ISSUE_DATA = [
  { name: "Late", value: 35 },
  { name: "Rejected", value: 15 },
  { name: "Damaged", value: 5 },
  { name: "Other", value: 10 },
];

// ----------------- UI PRIMITIVES -----------------
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white border border-gray-200 shadow-sm rounded-2xl p-5 ${className}`}>{children}</div>;
}

function Metric({ label, value, sub }: { label: string; value: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-end gap-3">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {sub && <span className="text-xs text-gray-400">{sub}</span>}
      </div>
    </div>
  );
}

// small status pill for generic reuse
function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Completed"
      ? "bg-green-100 text-green-700"
      : status === "Canceled"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";
  return <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status}</span>;
}

// ----------------- MAIN PAGE -----------------
export default function DriversPerformanceReport(): JSX.Element {
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState<string | "All">("All");
  const [page, setPage] = useState(1);
  const PAGE = 6;

  // zones list
  const zones = useMemo(() => Array.from(new Set(SAMPLE_DRIVERS.map((d) => d.zone))), []);

  // filtered drivers
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return SAMPLE_DRIVERS.filter((d) => {
      if (zoneFilter !== "All" && d.zone !== zoneFilter) return false;
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
    });
  }, [query, zoneFilter]);

  // paging
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const paged = useMemo(() => filtered.slice((page - 1) * PAGE, page * PAGE), [filtered, page]);

  // leaderboard: score-based
  const leaderboard = useMemo(() => {
    return [...SAMPLE_DRIVERS]
      .map((d) => ({
        ...d,
        score: +(d.rating * 20 + (100 - d.avgDeliveryMin) + d.acceptRate / 2 - d.lateDeliveries * 5).toFixed(1),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, []);

  // KPIs
  const totalDeliveries = useMemo(() => SAMPLE_DRIVERS.reduce((s, d) => s + d.deliveries, 0), []);
  const avgRating = useMemo(() => +(SAMPLE_DRIVERS.reduce((s, d) => s + d.rating, 0) / SAMPLE_DRIVERS.length).toFixed(2), []);
  const avgDelivery = useMemo(() => +(SAMPLE_DRIVERS.reduce((s, d) => s + d.avgDeliveryMin, 0) / SAMPLE_DRIVERS.length).toFixed(1), []);

  // charts: zone and revenue-by-day like data
  const zoneChart = useMemo(() => zones.map((z) => ({ name: z, value: filtered.filter((o) => o.zone === z).length })), [zones, filtered]);

 /*  const revenueByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of filtered) map[o.date] = (map[o.date] || 0) + (o as any).amount || 0; 
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, revenue: +map[d].toFixed ? map[d].toFixed(2) : map[d] }));
  }, [filtered]); */

  // CSV export
  const exportCSV = useCallback(() => {
    const header = "id,name,deliveries,acceptRate,avgDeliveryMin,rating,lateDeliveries,zone";
    const rows = SAMPLE_DRIVERS.map((d) => `${d.id},${d.name},${d.deliveries},${d.acceptRate},${d.avgDeliveryMin},${d.rating},${d.lateDeliveries},${d.zone}`);
    const blob = new Blob([header + "\n" + rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drivers-performance-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // reset page on filter changes
  useEffect(() => {
  Promise.resolve().then(() => setPage(1));
}, [query, zoneFilter]);


  // animation variants (framer-motion)
/*   const barVariants = {
    hidden: { width: 0 },
    show: (w: number) => ({ width: `${w}%`, transition: { duration: 0.8, ease: "easeOut" } }),
  }; */

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <span className="inline-flex items-center justify-center rounded-full w-10 h-10 bg-[linear-gradient(90deg,#ff6584,#dc3173)] shadow text-white">
                <Truck className="w-5 h-5" />
              </span>
              Drivers Performance
            </h1>
            <p className="text-sm text-gray-500 mt-1">Performance score · Deliveries · Ratings · Operational insights</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-white border px-3 py-2 rounded-xl shadow-sm">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search drivers..."
                className="ml-2 bg-transparent outline-none text-sm"
              />
            </div>

            <select
              value={zoneFilter}
              onChange={(e) => setZoneFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white text-sm"
            >
              <option value="All">All zones</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>

            <button onClick={exportCSV} className="px-4 py-2 rounded-xl text-white shadow" style={{ background: PRIMARY }}>
              <DownloadCloud className="w-4 h-4 inline mr-1" /> Export
            </button>
          </div>
        </header>

        {/* KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <Metric label="Total Deliveries" value={totalDeliveries} sub="Last 30 days" />
          </Card>

          <Card>
            <Metric label="Average Rating" value={`${avgRating}/5`} sub="Customer reviews" />
          </Card>

          <Card>
            <Metric label="Avg Delivery Time" value={`${avgDelivery} min`} sub="Across drivers" />
          </Card>

          <Card>
            <Metric
              label="Total Late Deliveries"
              value={SAMPLE_DRIVERS.reduce((s, d) => s + d.lateDeliveries, 0)}
              sub="Action required"
            />
          </Card>
        </section>

        {/* Charts grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie: Issues */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Issue Breakdown</h3>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>

            <div className="flex items-center gap-4">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie data={ISSUE_DATA} dataKey="value" nameKey="name" outerRadius={60} innerRadius={30} label>
                      {ISSUE_DATA.map((entry, i) => (
                        <Cell key={i} fill={ISSUE_COLORS[i % ISSUE_COLORS.length]} />
                      ))}
                    </Pie>
                  </RePieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1">
                {ISSUE_DATA.map((it) => (
                  <div key={it.name} className="flex items-center justify-between text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: ISSUE_COLORS[ISSUE_DATA.indexOf(it) % ISSUE_COLORS.length] }} />
                      <span className="text-sm">{it.name}</span>
                    </div>
                    <div className="text-sm text-gray-600">{it.value}</div>
                  </div>
                ))}
                <div className="mt-3">
                  <button className="w-full px-3 py-2 rounded-lg bg-white border text-sm">Open Quality Panel</button>
                </div>
              </div>
            </div>
          </Card>

          {/* Bar: Orders by Zone */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Orders by Zone</h3>
              <div className="text-xs text-gray-500">Distribution</div>
            </div>

            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={zoneChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={PRIMARY} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Area: Delivery Trend */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Delivery Time Trend</h3>
              <div className="text-xs text-gray-500">Last 10 days</div>
            </div>

            <div style={{ height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DELIVERY_TREND}>
                  <defs>
                    <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor={PRIMARY} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={PRIMARY} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="avgMin" stroke={PRIMARY} fill="url(#g1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </section>

        {/* Table + Right analytics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table (left, spans 2 columns) */}
          <section className="lg:col-span-2">
            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold">Drivers</h3>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">Showing {filtered.length} drivers</div>
                  <div className="text-xs text-gray-500">Page {page} / {totalPages}</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-xs text-gray-500">
                    <tr className="border-b">
                      <th className="p-3 text-left">Driver</th>
                      <th className="p-3 text-left">Deliveries</th>
                      <th className="p-3 text-left">Accept %</th>
                      <th className="p-3 text-left">Avg min</th>
                      <th className="p-3 text-left">Rating</th>
                      <th className="p-3 text-left">Late</th>
                      <th className="p-3 text-left">Zone</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map((d) => (
                      <tr key={d.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div className="font-medium">{d.name}</div>
                          <div className="text-xs text-gray-500">{d.id}</div>
                        </td>
                        <td className="p-3">{d.deliveries}</td>
                        <td className="p-3">{d.acceptRate}%</td>
                        <td className="p-3">{d.avgDeliveryMin} min</td>
                        <td className="p-3">{d.rating}</td>
                        <td className="p-3">{d.lateDeliveries}</td>
                        <td className="p-3">{d.zone}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button className="px-2 py-1 rounded bg-white border text-sm">Profile</button>
                            <button className="px-2 py-1 rounded bg-white border text-sm">Details</button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {paged.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-6 text-center text-gray-500">
                          No drivers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 flex items-center justify-between border-t border-gray-100">
                <div className="text-xs text-gray-600">
                  Showing {Math.min((page - 1) * PAGE + 1, filtered.length)} - {Math.min(page * PAGE, filtered.length)} of {filtered.length}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-2 rounded bg-white border">
                    <ChevronLeft />
                  </button>
                  <div className="px-3 py-1 bg-white border rounded text-sm">{page} / {totalPages}</div>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-2 rounded bg-white border">
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </Card>
          </section>

          {/* Right analytics column */}
          <aside>
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Top Drivers</h3>
                <div className="text-xs text-gray-500">Score</div>
              </div>

              <div className="space-y-3">
                {leaderboard.map((d, idx) => {
                  const max = leaderboard[0]?.score || 100;
                  const percent = Math.round((d.score / max) * 100);
                  return (
                    <div key={d.id} className="flex items-center gap-3">
                      <div className="w-10">
                        <div className="text-sm font-medium">#{idx + 1}</div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium">{d.name}</div>
                            <div className="text-xs text-gray-500">{d.zone} • {d.deliveries} deliveries</div>
                          </div>

                          <div className="text-sm font-semibold">{d.score}</div>
                        </div>

                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-2 rounded-full"
                            style={{ background: `linear-gradient(90deg, ${PRIMARY}, ${ACCENT})` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <div className="mt-4 space-y-4">
              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Peak Hours</h3>
                  <div className="text-xs text-gray-500">Approx</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className={`p-2 rounded text-center ${i % 3 === 0 ? "bg-yellow-50" : "bg-gray-50"}`}>
                      {8 + i}:00 - {8 + i + 1}:00
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Quick Actions</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <button className="w-full px-3 py-2 rounded bg-white border">Message low-rated drivers</button>
                  <button className="w-full px-3 py-2 rounded bg-white border">Open Quality Panel</button>
                </div>
              </Card>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}


