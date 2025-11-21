

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { JSX, useMemo, useState } from "react";
import { Download, Calendar, DollarSign, TrendingUp, Users, Search, BarChart3, BadgeEuroIcon } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts";

// ----------------------------------------------------------------------
// Types
// ----------------------------------------------------------------------
type EarningRow = {
  id: string;
  date: string;
  orderId: string;
  vendor: string;
  region: string;
  gross: number;
  platformFee: number;
  status: "Paid" | "Pending" | "Refunded";
};

// ----------------------------------------------------------------------
// Dummy data
// ----------------------------------------------------------------------
const sampleChartData = [
  { name: "Jan", earnings: 1200 },
  { name: "Feb", earnings: 2100 },
  { name: "Mar", earnings: 3500 },
  { name: "Apr", earnings: 2800 },
  { name: "May", earnings: 4200 },
  { name: "Jun", earnings: 4800 },
  { name: "Jul", earnings: 5200 },
  { name: "Aug", earnings: 6100 },
  { name: "Sep", earnings: 5400 },
  { name: "Oct", earnings: 6800 },
  { name: "Nov", earnings: 7200 },
];

const sampleRows: EarningRow[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `E-${1000 + i}`,
  date: `2025-11-${(i + 5).toString().padStart(2, "0")}`,
  orderId: `ORD-${2300 + i}`,
  vendor: `Vendor ${i + 1}`,
  region: ["Lisbon", "Porto", "Faro", "Coimbra"][i % 4],
  gross: Math.round(50 + Math.random() * 450),
  platformFee: Math.round(10 + Math.random() * 80),
  status: ["Paid", "Pending", "Refunded"][i % 3] as any,
}));

function formatCurrency(v: number) {
  return `€${v.toLocaleString()}`;
}

// ----------------------------------------------------------------------
// MAIN COMPONENT (CLEAN, NO OVERFLOW)
// ----------------------------------------------------------------------
export default function PlatformEarningsPage(): JSX.Element {
  const [query, setQuery] = useState("");
  const [rows] = useState<EarningRow[]>(sampleRows);
  const [range, setRange] = useState("Last 30 days");
  const [perPage, setPerPage] = useState(8);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const q = query.toLowerCase();
      return (
        r.orderId.toLowerCase().includes(q) ||
        r.vendor.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q)
      );
    });
  }, [rows, query]);

  const paginated = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  const totalGross = filtered.reduce((s, r) => s + r.gross, 0);
  const totalPlatform = filtered.reduce((s, r) => s + r.platformFee, 0);

  const exportCSV = () => {
    const header = ["id", "date", "orderId", "vendor", "region", "gross", "platformFee", "status"];
    const csv = [header.join(",")] 
      .concat(
        filtered.map((r) =>
          [r.id, r.date, r.orderId, r.vendor, r.region, r.gross, r.platformFee, r.status].join(",")
        )
      )
      .join("");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform-earnings.csv";
    a.click();
  };

  return (
    <div className="p-6 lg:p-10 space-y-6 overflow-x-hidden">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-gray-900">
            <BarChart3 className="w-7 h-7 text-[#DC3173]" /> Platform Earnings
          </h1>
          <p className="text-sm text-gray-500">Track platform revenue & fees in a simple clean layout.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
            <Calendar className="w-4 h-4 text-[#DC3173]" />
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Year to date</option>
            </select>
          </div>

          <div className="flex items-center bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100 w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order, vendor, region"
              className="ml-2 bg-transparent outline-none text-sm w-full"
            />
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#DC3173] text-white shadow hover:opacity-90"
          >
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* SUMMARY + CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <div className="p-3 rounded-full bg-[#DC3173]/10">
                <BadgeEuroIcon className="w-6 h-6 text-[#DC3173]" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Gross</p>
                <h2 className="text-2xl font-bold">{formatCurrency(totalGross)}</h2>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">Platform Fees</p>
              <h2 className="text-xl font-semibold text-[#DC3173]">{formatCurrency(totalPlatform)}</h2>
            </div>
          </div>

          <div className="mt-6 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleChartData}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFE1ED" stopOpacity={1} />
                    <stop offset="100%" stopColor="#FFF5F9" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <Tooltip />
                <Area type="monotone" dataKey="earnings" stroke="#DC3173" strokeWidth={2} fill="url(#grad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-md bg-[#DC3173]/10">
              <Users className="w-5 h-5 text-[#DC3173]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active Vendors</p>
              <h3 className="text-xl font-semibold">{Math.floor(20 + Math.random() * 50)}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 text-green-600 text-sm">
            <TrendingUp className="w-4 h-4" /> Growth +12.4%
          </div>

          <p className="text-sm text-gray-500 leading-relaxed">Platform vendor activity trends for this period.</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="min-w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="py-3 px-3 text-left">Date</th>
                <th className="py-3 px-3 text-left">Order</th>
                <th className="py-3 px-3 text-left">Vendor</th>
                <th className="py-3 px-3 text-left">Region</th>
                <th className="py-3 px-3 text-left">Gross (€)</th>
                <th className="py-3 px-3 text-left">Platform Fee (€)</th>
                <th className="py-3 px-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginated.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-3 px-3 whitespace-nowrap">{r.date}</td>
                  <td className="py-3 px-3 font-medium whitespace-nowrap">{r.orderId}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.vendor}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{r.region}</td>
                  <td className="py-3 px-3 whitespace-nowrap">{formatCurrency(r.gross)}</td>
                  <td className="py-3 px-3 text-[#DC3173] whitespace-nowrap">{formatCurrency(r.platformFee)}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        r.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : r.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FOOTER */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            Rows:
            <select
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              className="px-2 py-1 rounded-md border"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            Page {page} of {Math.ceil(filtered.length / perPage) || 1}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 border rounded-md"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 border rounded-md"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
