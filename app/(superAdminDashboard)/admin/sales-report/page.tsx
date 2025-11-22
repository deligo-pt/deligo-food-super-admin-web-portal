"use client"
import React, { JSX, useMemo, useState } from "react";
import { Calendar, DownloadCloud, Filter, ChevronDown, Eye, ChevronLeft, ChevronRight, Search, BarChart2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";



type Order = {
  id: string;
  date: string; // YYYY-MM-DD
  restaurant: string;
  amount: number;
  status: "Completed" | "Canceled" | "Pending";
};

const DELIGO = "#DC3173";

const sampleOrders: Order[] = [
  { id: "S-1001", date: "2025-11-01", restaurant: "Casa Portuguesa", amount: 24.5, status: "Completed" },
  { id: "S-1002", date: "2025-11-02", restaurant: "Pizzeria Lisboa", amount: 18.0, status: "Completed" },
  { id: "S-1003", date: "2025-11-03", restaurant: "Sushi Porto", amount: 40.0, status: "Pending" },
  { id: "S-1004", date: "2025-11-04", restaurant: "Tasca do Mar", amount: 12.75, status: "Canceled" },
  { id: "S-1005", date: "2025-11-05", restaurant: "Casa Portuguesa", amount: 30.2, status: "Completed" },
  { id: "S-1006", date: "2025-11-06", restaurant: "Pizzeria Lisboa", amount: 22.0, status: "Completed" },
  { id: "S-1007", date: "2025-11-07", restaurant: "Sabor do Sul", amount: 55.0, status: "Completed" },
  { id: "S-1008", date: "2025-11-08", restaurant: "Taberna Velha", amount: 16.4, status: "Pending" },
];

const revenueData = [
  { date: "2025-11-01", revenue: 245 },
  { date: "2025-11-02", revenue: 380 },
  { date: "2025-11-03", revenue: 300 },
  { date: "2025-11-04", revenue: 120 },
  { date: "2025-11-05", revenue: 420 },
  { date: "2025-11-06", revenue: 520 },
  { date: "2025-11-07", revenue: 610 },
  { date: "2025-11-08", revenue: 480 },
];

export default function SalesReportPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [showCanceled, setShowCanceled] = useState(true);
  const [range, setRange] = useState("Last 7 days");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sampleOrders
      .filter((o) => (showCanceled ? true : o.status !== "Canceled"))
      .filter((o) => {
        if (!q) return true;
        return (
          o.restaurant.toLowerCase().includes(q) ||
          o.id.toLowerCase().includes(q) ||
          o.status.toLowerCase().includes(q)
        );
      });
  }, [query, showCanceled]);

  const pageSize = 5;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const totals = useMemo(() => {
    const totalRevenue = sampleOrders.reduce((s, o) => s + o.amount, 0);
    const completed = sampleOrders.filter((s) => s.status === "Completed").length;
    const canceled = sampleOrders.filter((s) => s.status === "Canceled").length;
    const avgOrder = +(totalRevenue / sampleOrders.length).toFixed(2);
    return { totalRevenue, completed, canceled, avgOrder };
  }, []);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold">Sales Report</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">Overview of revenue, orders and top metrics for your delivery platform.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-white dark:bg-gray-800 shadow-sm rounded p-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <select
                aria-label="date-range"
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200"
              >
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This Month</option>
                <option>Custom Range</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-gray-800 shadow hover:shadow-md transition"
              title="Export CSV"
            >
              <DownloadCloud className="w-4 h-4 text-gray-700" />
              <span className="text-sm">Export</span>
            </button>

            <button
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white dark:bg-gray-800 shadow hover:shadow-md transition"
              title="Filters"
            >
              <Filter className="w-4 h-4 text-gray-700" />
              <span className="text-sm">Filter</span>
            </button>
          </div>
        </div>

        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.02 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-semibold mt-1">€{totals.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: `${DELIGO}22` }}>
              <BarChart2 className="w-6 h-6" color={DELIGO} />
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.04 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed Orders</p>
              <p className="text-xl font-semibold mt-1">{totals.completed}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.06 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Canceled</p>
              <p className="text-xl font-semibold mt-1">{totals.canceled}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </div>
          </motion.div>

          <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.08 }} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Avg Order</p>
              <p className="text-xl font-semibold mt-1">€{totals.avgOrder}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: `${DELIGO}22` }}>
              <FileText className="w-6 h-6" color={DELIGO} />
            </div>
          </motion.div>
        </div>

        {/* Main grid: Chart + Right column */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart area */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Revenue</h2>
              <div className="flex items-center gap-3">
                <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded p-2">
                  <Search className="w-4 h-4 text-gray-600" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search orders or restaurants" className="bg-transparent outline-none text-sm w-56" />
                </div>
                <button className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-white dark:bg-gray-700 shadow-sm hover:shadow-md transition">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">Preview</span>
                </button>
              </div>
            </div>

            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DELIGO} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={DELIGO} stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e6e6e6" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke={DELIGO} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">This Week</p>
                <p className="font-semibold mt-1">€{revenueData.slice(-7).reduce((s, r) => s + r.revenue, 0)}</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="font-semibold mt-1">€{revenueData.reduce((s, r) => s + r.revenue, 0)}</p>
              </div>

              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/40">
                <p className="text-xs text-gray-500">Top Earning Day</p>
                <p className="font-semibold mt-1">{revenueData.reduce((a, b) => (a.revenue > b.revenue ? a : b)).date}</p>
              </div>
            </div>
          </motion.div>

          {/* Right column: Orders table & quick filters */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Recent Orders</h3>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={showCanceled} onChange={() => setShowCanceled((s) => !s)} className="w-4 h-4" />
                  <span className="text-xs text-gray-500">Show Canceled</span>
                </label>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="pb-2">ID</th>
                    <th className="pb-2">Restaurant</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => (
                    <tr key={o.id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-3">{o.id}</td>
                      <td className="py-3 font-medium">{o.restaurant}</td>
                      <td className="py-3 text-gray-500">{o.date}</td>
                      <td className="py-3">€{o.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          o.status === "Completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700" : o.status === "Canceled" ? "bg-red-100 dark:bg-red-900/30 text-red-700" : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700"
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button title="View" className="p-2 rounded-md bg-gray-50 dark:bg-gray-900/40 hover:shadow"> <Eye className="w-4 h-4" /></button>
                          <button title="Export" className="p-2 rounded-md bg-white dark:bg-gray-800 hover:bg-gray-50"> <DownloadCloud className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {paged.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-gray-500">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">Showing {Math.min((page - 1) * pageSize + 1, filtered.length)} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}</div>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700" title="Previous"><ChevronLeft className="w-4 h-4" /></button>
                <div className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border">{page} / {pages}</div>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} className="p-2 rounded-md bg-gray-100 dark:bg-gray-700" title="Next"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom analytics area: example bar chart for categories or zones */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Earnings by Day</h3>
            <div className="text-sm text-gray-500">Last 7 days</div>
          </div>

          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill={DELIGO} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
