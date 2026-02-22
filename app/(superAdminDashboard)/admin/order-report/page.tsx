/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  BarChart,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  Filter,
  PieChart,
  Search,
} from "lucide-react";
import React, { JSX, useCallback, useMemo, useState } from "react";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  BarChart as ReBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// ---- Constants ----
const DELIGO = "#DC3173";

// ---- Sample Data (DEV) ----
// Replace ORDERS with server-side data in production or fetch from API.
const ORDERS = Array.from({ length: 80 }).map((_, i) => {
  const statuses = ["Completed", "Pending", "Canceled"];
  const status = statuses[i % statuses.length];
  const zones = ["Lisbon", "Porto", "Coimbra", "Faro"];
  return {
    id: `OR-${10000 + i}`,
    date: `2025-11-${String((i % 30) + 1).padStart(2, "0")}`,
    time: `${String(10 + (i % 12)).padStart(2, "0")}:${String((i * 3) % 60).padStart(2, "0")}`,
    restaurant: ["Casa Portuguesa", "SushiGo", "Italian Dreams", "MeatLab"][
      i % 4
    ],
    courier: `Courier ${i % 7}`,
    zone: zones[i % zones.length],
    amount: +(10 + Math.random() * 90).toFixed(2),
    status,
  };
});

// ---- Small reusable UI primitives ----
function MetricCard({
  label,
  value,
  subtitle,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl p-5 rounded-2xl shadow border border-white/10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ background: `${DELIGO}1A` }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cls =
    status === "Completed"
      ? "bg-green-100 dark:bg-green-900/30 text-green-700"
      : status === "Canceled"
        ? "bg-red-100 dark:bg-red-900/30 text-red-700"
        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700";
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${cls}`}>{status}</span>
  );
}

function Pagination({
  page,
  pages,
  onPrev,
  onNext,
}: {
  page: number;
  pages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        aria-label="Previous page"
        className="p-2 rounded-md bg-gray-100 dark:bg-gray-700"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border text-sm">
        {page} / {pages}
      </div>
      <button
        onClick={onNext}
        aria-label="Next page"
        className="p-2 rounded-md bg-gray-100 dark:bg-gray-700"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ---- Main Page ----
export default function OrderReportPage(): JSX.Element {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "All">("All");
  const [zoneFilter, setZoneFilter] = useState<string | "All">("All");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const zones = useMemo(
    () =>
      Array.from(new Set(ORDERS.map((o) => o.zone))).filter(
        Boolean,
      ) as string[],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ORDERS.filter((o) => {
      if (statusFilter !== "All" && o.status !== statusFilter) return false;
      if (zoneFilter !== "All" && o.zone !== zoneFilter) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        o.restaurant.toLowerCase().includes(q) ||
        o.courier.toLowerCase().includes(q)
      );
    });
  }, [query, statusFilter, zoneFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const zoneChart = useMemo(
    () =>
      zones.map((z) => ({
        name: z,
        value: filtered.filter((o) => o.zone === z).length,
      })),
    [zones, filtered],
  );

  const revenueByDay = useMemo(() => {
    // simple group by date for area chart
    const map: Record<string, number> = {};
    for (const o of filtered) {
      map[o.date] = (map[o.date] || 0) + o.amount;
    }
    return Object.keys(map)
      .sort()
      .map((d) => ({ date: d, revenue: +map[d].toFixed(2) }));
  }, [filtered]);

  const totalRevenue = useMemo(
    () => filtered.reduce((s, o) => s + o.amount, 0),
    [filtered],
  );
  const avgOrder = useMemo(
    () => +(totalRevenue / (filtered.length || 1)).toFixed(2),
    [totalRevenue, filtered.length],
  );

  // Export CSV with robust quoting & newlines
  const exportCSV = useCallback(() => {
    const header = [
      "id",
      "restaurant",
      "date",
      "time",
      "courier",
      "zone",
      "amount",
      "status",
    ];
    const rows = filtered.map((o) => [
      o.id,
      o.restaurant.replace(/"/g, '""'),
      o.date,
      o.time,
      o.courier.replace(/"/g, '""'),
      o.zone.replace(/"/g, '""'),
      o.amount,
      o.status,
    ]);
    const csv = [
      header.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  // Ensure page resets when filters change
  React.useEffect(() => setPage(1), [query, statusFilter, zoneFilter]);

  return (
    <div className="min-h-screen p-6 md:p-10 bg-linear-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:via-gray-950 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <TitleHeader
          title={t("order_report")}
          subtitle={t("full_analytics_performance_insights")}
        />
        <div className="flex items-center gap-3 mb-6">
          <div className="hidden md:flex items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              placeholder={t("search_orders")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="ml-2 bg-transparent outline-none text-sm w-48"
            />
          </div>

          <button
            className="px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2"
          >
            <Filter className="w-4 h-4" /> {t("filters")}
          </button>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-xl shadow text-white font-medium"
            style={{ background: DELIGO }}
          >
            <DownloadCloud className="w-4 h-4 inline" /> {t("export")}
          </button>
        </div>

        {/* Metrics */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label={t("total_revenue")}
            value={`€${totalRevenue.toFixed(2)}`}
            subtitle={`Avg order: €${avgOrder}`}
            icon={<BarChart className="w-5 h-5" />}
          />

          <MetricCard
            label={t("total_orders")}
            value={filtered.length}
            subtitle={`${t("zones")}: ${zones.length}`}
            icon={<PieChart className="w-5 h-5" />}
          />

          <MetricCard
            label={t("avg_order")}
            value={`€${avgOrder}`}
            subtitle={t("order_level_average")}
            icon={<Search className="w-5 h-5" />}
          />
        </section>

        {/* Charts grid */}
        <section className="grid grid-cols-1 gap-6">
          {/* Bar - Zone counts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> {t("orders_by_zone")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={zoneChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={DELIGO} />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Area - Revenue trend */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart className="w-4 h-4" /> {t("revenue_trend")}
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueByDay}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DELIGO} stopOpacity={0.6} />
                      <stop
                        offset="95%"
                        stopColor={DELIGO}
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke={DELIGO}
                    fill="url(#revGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Table + right analytics */}
        <section className="grid grid-cols-1 gap-6">
          {/* Table */}
          <section className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
            <div className="overflow-x-auto">
              <table
                className="w-full text-sm"
                role="table"
                aria-label="Orders table"
              >
                <thead>
                  <tr className="text-xs text-gray-500">
                    <th className="pb-2">{t("id")}</th>
                    <th className="pb-2">{t("restaurant")}</th>
                    <th className="pb-2">
                      {t("date")} / {t("time")}
                    </th>
                    <th className="pb-2">{t("courier")}</th>
                    <th className="pb-2">{t("zone")}</th>
                    <th className="pb-2">{t("amount")}</th>
                    <th className="pb-2">{t("status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((o) => (
                    <tr
                      key={o.id}
                      className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="py-3 font-mono">{o.id}</td>
                      <td className="py-3 font-medium">{o.restaurant}</td>
                      <td className="py-3 text-gray-500">
                        {o.date} <span className="ml-2">{o.time}</span>
                      </td>
                      <td className="py-3">{o.courier}</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-900">
                          {o.zone}
                        </span>
                      </td>
                      <td className="py-3">€{o.amount.toFixed(2)}</td>
                      <td className="py-3">
                        <StatusPill status={o.status} />
                      </td>
                    </tr>
                  ))}

                  {paged.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="py-6 text-center text-sm text-gray-500"
                      >
                        {t("no_orders_found")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {t("showing")}{" "}
                {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)} -{" "}
                {Math.min(page * PAGE_SIZE, filtered.length)} {t("of")}{" "}
                {filtered.length}
              </div>
              <Pagination
                page={page}
                pages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
          </section>

          {/* Right analytics */}
          <aside className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">{t("zone_analytics")}</h3>
              <div className="text-sm text-gray-500">{t("last_30_days")}</div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">
                {t("peak_hour_approx")}
              </h4>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded ${i % 4 === 0 ? "bg-(--deligo) text-white" : "bg-gray-100 dark:bg-gray-900"}`}
                  >
                    {8 + i}:00 - {8 + i + 1}:00
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 border-t pt-3">
              <h4 className="text-sm font-medium">{t("quick_filters")}</h4>
              <div className="flex flex-wrap gap-2 mt-2">
                <button
                  onClick={() => {
                    setZoneFilter("All");
                    setStatusFilter("All");
                    setPage(1);
                  }}
                  className="px-3 py-1 rounded bg-gray-50 dark:bg-gray-900"
                >
                  {t("reset")}
                </button>
                <button
                  onClick={() => {
                    setZoneFilter(zones[0] ?? "All");
                    setPage(1);
                  }}
                  className="px-3 py-1 rounded bg-white dark:bg-gray-800"
                >
                  {t("top_zone")}
                </button>
                <button
                  onClick={() => {
                    setStatusFilter("Canceled");
                    setPage(1);
                  }}
                  className="px-3 py-1 rounded bg-white dark:bg-gray-800"
                >
                  {t("show_cancelled")}
                </button>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
