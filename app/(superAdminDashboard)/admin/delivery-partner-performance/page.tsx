/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { motion } from "framer-motion";
import React, { useEffect, useMemo, useState } from "react";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { Download, Eye, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// --- Config / constants ---
const DELIGO = "#DC3173";
// Use exact local path you uploaded (developer instruction). Replace if you want CDN.
const SAMPLE_AVATAR = "/mnt/data/Screenshot from 2025-11-21 00-13-57.png";

// --- Types ---
type MonthStat = {
  month: string;
  deliveries: number;
  avgTime: number;
  onTimePct: number;
  revenue: number;
};
type PartnerSummary = {
  id: string;
  name: string;
  city: string;
  rating: number;
  deliveries: number;
  onTimePct: number;
  avgTime: number; // minutes
  cancelPct: number;
  earnings: number;
  lastActive?: string;
  vehicle?: string;
  monthTrend: MonthStat[]; // for drill-down
};

// ----------------- Utility helpers -----------------
function initials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
// function formatNumber(n: number) {
//   return n.toLocaleString();
// }
function calcAvg(list: PartnerSummary[], key: "onTimePct" | "avgTime") {
  if (!list.length) return 0;
  return (
    Math.round(
      (list.reduce((s, p) => s + (p[key] as number), 0) / list.length) * 100,
    ) / 100
  );
}
function calcSum(list: PartnerSummary[], key: "earnings") {
  return list.reduce((s, p) => s + (p[key] as number), 0);
}

// ----------------- Small UI components -----------------
function KPICard({
  title,
  value,
  icon,
}: {
  title: string;
  value: any;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
      </div>
      <div className="text-2xl" style={{ color: DELIGO }}>
        {icon || <Users />}
      </div>
    </Card>
  );
}

function RangeBtn({
  label,
  v,
  state,
  set,
}: {
  label: string;
  v: "30" | "90" | "365";
  state: string;
  set: (s: any) => void;
}) {
  const active = state === v;
  return (
    <button
      onClick={() => set(v)}
      className={`px-2 py-1 text-sm rounded-md border ${active ? "bg-white border-slate-300" : "bg-transparent"}`}
    >
      {label}
    </button>
  );
}

// ----------------- Main Page -----------------
export default function DeliveryPartnerPerformancePage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [partners, setPartners] = useState<PartnerSummary[]>([]);
  const [selected, setSelected] = useState<PartnerSummary | null>(null);
  const [dateRange, setDateRange] = useState<"30" | "90" | "365">("30");
  const [sortBy, setSortBy] = useState<"deliveries" | "onTimePct" | "earnings">(
    "deliveries",
  );

  useEffect(() => {
    (() => setPartners(mockPartners()))();
  }, []);

  // Filter + sort (fast, client-side; wire to API later for large data)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = partners.filter((p) =>
      q ? `${p.name} ${p.city} ${p.id}`.toLowerCase().includes(q) : true,
    );
    return base.sort((a, b) => {
      if (sortBy === "deliveries") return b.deliveries - a.deliveries;
      if (sortBy === "onTimePct") return b.onTimePct - a.onTimePct;
      return b.earnings - a.earnings;
    });
  }, [partners, query, sortBy]);

  const topPartners = filtered.slice(0, 6);

  // aggregated monthly chart (sum of top partners for demonstration)
  const monthly = useMemo(() => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months
      .map((m, i) => {
        const deliveries = topPartners.reduce(
          (s, p) => s + (p.monthTrend[i]?.deliveries || 0),
          0,
        );
        const revenue = topPartners.reduce(
          (s, p) => s + (p.monthTrend[i]?.revenue || 0),
          0,
        );
        return { month: m, deliveries, revenue };
      })
      .slice(-Math.max(3, Number(dateRange) / 30)); // show last n months
  }, [topPartners, dateRange]);

  // Export CSV
  function exportCSV() {
    const head = [
      "ID",
      "Name",
      "City",
      "Deliveries",
      "OnTime %",
      "AvgTime (m)",
      "Cancel %",
      "Earnings (€)",
    ];
    const rows = filtered.map((p) => [
      p.id,
      p.name,
      p.city,
      String(p.deliveries),
      String(p.onTimePct),
      String(p.avgTime),
      String(p.cancelPct),
      String(p.earnings),
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `partner_performance_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <TitleHeader
        title={t("delivery_partner_performance")}
        subtitle={t("overview_of_delivery_partner_kpi_monthly")}
      />
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_by_name_city_id")}
            className="max-w-md"
          />
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSortBy("deliveries")}
              className={sortBy === "deliveries" ? "bg-white border" : ""}
            >
              {t("top_deliveries")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy("onTimePct")}
              className={sortBy === "onTimePct" ? "bg-white border" : ""}
            >
              {t("best_on_time")}
            </Button>
            <Button
              variant="outline"
              onClick={() => setSortBy("earnings")}
              className={sortBy === "earnings" ? "bg-white border" : ""}
            >
              {t("top_earnings")}
            </Button>
          </div>
          <Button onClick={exportCSV} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            {t("export_csv")}
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title={t("total_partners_filtered")}
          value={filtered.length}
          icon={<Users />}
        />
        <KPICard
          title={t("avg_on_time")}
          value={`${calcAvg(filtered, "onTimePct")}%`}
        />
        <KPICard
          title={t("avg_delivery_time")}
          value={`${calcAvg(filtered, "avgTime")} min`}
        />
        <KPICard
          title={t("total_earnings")}
          value={`€ ${calcSum(filtered, "earnings").toLocaleString()}`}
        />
      </div>

      {/* Charts + Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Revenue / Deliveries Chart */}
        <Card className="p-6 h-72">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold">
                {t("deliveries_revenue")} (
                {dateRange === "30"
                  ? "Last 3 months"
                  : dateRange === "90"
                    ? t("last_6_months")
                    : t("last_12_months")}
                )
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {t("aggregated_for_top_partners")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <RangeBtn
                label="3m"
                v="30"
                state={dateRange}
                set={setDateRange}
              />
              <RangeBtn
                label="6m"
                v="90"
                state={dateRange}
                set={setDateRange}
              />
              <RangeBtn
                label="12m"
                v="365"
                state={dateRange}
                set={setDateRange}
              />
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value: any, name: string) =>
                    name === "revenue"
                      ? `€ ${Number(value).toLocaleString()}`
                      : value
                  }
                />
                <Bar
                  dataKey="deliveries"
                  yAxisId="left"
                  fill={DELIGO}
                  barSize={14}
                />
                <Bar
                  dataKey="revenue"
                  yAxisId="right"
                  fill="#3B82F6"
                  barSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-4 col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg">{t("top_partners")}</h4>
            <div className="text-sm text-slate-500">
              {t("sorted_by")} <strong>{sortBy}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topPartners.map((p, idx) => (
              <motion.div
                key={p.id}
                whileHover={{ scale: 1.01 }}
                className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={SAMPLE_AVATAR} />
                    <AvatarFallback>{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">
                      {idx + 1}. {p.name}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {p.city} • {p.vehicle || "—"}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t("rating")}: <strong>{p.rating} ⭐</strong>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-slate-500">
                    {t("deliveries")}
                  </div>
                  <div className="font-bold text-lg">{p.deliveries}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    € {p.earnings.toLocaleString()}
                  </div>
                  <div className="mt-2 flex items-center gap-2 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(p)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {t("view")}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full table (scrollable) */}
      <Card className="p-4 overflow-x-auto">
        <table className="min-w-[1100px] w-full text-sm">
          <thead className="bg-slate-100 text-slate-700 font-semibold">
            <tr>
              <th className="px-4 py-2 text-left w-[60px]">#</th>
              <th className="px-4 py-2 text-left w-[260px]">{t("partner")}</th>
              <th className="px-4 py-2 text-center w-[120px]">{t("city")}</th>
              <th className="px-4 py-2 text-center w-[120px]">
                {t("deliveries")}
              </th>
              <th className="px-4 py-2 text-center w-[120px]">
                {t("on_time")} %
              </th>
              <th className="px-4 py-2 text-center w-[120px]">
                {t("avg_time")}
              </th>
              <th className="px-4 py-2 text-center w-[120px]">
                {t("cancel")} %
              </th>
              <th className="px-4 py-2 text-center w-[140px]">
                {t("earnings")}
              </th>
              <th className="px-4 py-2 text-center w-[120px]">
                {t("actions")}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {filtered.map((p, idx) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">{idx + 1}</td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={SAMPLE_AVATAR} />
                      <AvatarFallback>{initials(p.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 truncate">
                        {p.id} • {p.city}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-center">{p.city}</td>
                <td className="px-4 py-3 text-center font-semibold">
                  {p.deliveries}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold">{p.onTimePct}%</div>
                    <div className="h-2 w-20 bg-slate-200 rounded-full mt-1 overflow-hidden">
                      <div
                        style={{ width: `${p.onTimePct}%` }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-center">
                  {p.avgTime} {t("min")}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${p.cancelPct > 3 ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}
                  >
                    {p.cancelPct}%
                  </span>
                </td>

                <td className="px-4 py-3 text-center font-bold">
                  € {p.earnings.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(p)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      style={{ background: DELIGO }}
                      onClick={() => alert("Open payout modal (mock)")}
                    >
                      {t("payout")}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-500">
                  {t("no_partners_match_filters")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Drill-down sheet */}
      <Sheet
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <SheetContent className="max-w-3xl p-6 overflow-y-auto border-l bg-white">
          <SheetHeader>
            <SheetTitle>
              {t("partner_analytics")} — {selected?.name}
            </SheetTitle>
            <SheetDescription>
              {t("detailed_performance_monthly_growth")}
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={SAMPLE_AVATAR} />
                    <AvatarFallback>{initials(selected.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <div className="text-sm text-slate-500">
                      {selected.city} • {t("rating")}:{" "}
                      <strong>{selected.rating} ⭐</strong>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t("last_active")}: {selected.lastActive || "—"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="mt-4 mb-4">
                  <h4 className="font-semibold mb-2">{t("monthly_growth")}</h4>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selected.monthTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(v: any) => v} />
                        <Line
                          type="monotone"
                          dataKey="deliveries"
                          stroke={DELIGO}
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#047857"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">{t("recent_activity")}</h4>
                  <ul className="space-y-3 text-sm">
                    <li>• Completed 35 deliveries in last 7 days</li>
                    <li>• On-time rate improved by 4% vs previous period</li>
                    <li>• 1 cancellation in last 30 days</li>
                  </ul>
                </div>
              </div>

              <div className="col-span-1 space-y-4">
                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("deliveries")}</p>
                  <h3 className="text-2xl font-bold">{selected.deliveries}</h3>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("on_time")} %</p>
                  <h3 className="text-2xl font-bold">{selected.onTimePct}%</h3>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("avg_time")}</p>
                  <h3 className="text-2xl font-bold">
                    {selected.avgTime} {t("min")}
                  </h3>
                </Card>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    style={{ background: DELIGO }}
                    onClick={() => alert("Message partner (mock)")}
                  >
                    {t("message_partner")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => alert("View violations (mock)")}
                  >
                    {t("view_violations")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ---------------- Mock Data ----------------
function monthsForDemo() {
  const labels = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return labels.map((m) => ({
    month: m,
    deliveries: Math.floor(200 + Math.random() * 800),
    avgTime: Math.floor(20 + Math.random() * 20),
    onTimePct: Math.floor(70 + Math.random() * 30),
    revenue: Math.floor(2000 + Math.random() * 8000),
  }));
}

function mockPartners(): PartnerSummary[] {
  const baseMonths = monthsForDemo();
  const names = [
    "João Silva",
    "Maria Fernandes",
    "Rui Costa",
    "Ana Pereira",
    "Rui Almeida",
    "Rita Gomes",
    "Carlos Sousa",
    "Prego Urban",
  ];
  return names.map((n, i) => {
    const monthTrend = baseMonths.map((m) => ({
      month: m.month,
      deliveries: Math.max(
        20,
        Math.floor(m.deliveries * (0.6 + Math.random() * 0.8)),
      ),
      avgTime: Math.floor(15 + Math.random() * 20),
      onTimePct: Math.floor(70 + Math.random() * 25),
      revenue: Math.floor(m.revenue * (0.5 + Math.random() * 1.2)),
    }));
    const deliveries = monthTrend
      .slice(-3)
      .reduce((s, x) => s + x.deliveries, 0);
    const earnings = monthTrend.slice(-3).reduce((s, x) => s + x.revenue, 0);
    const onTime =
      Math.round(
        (monthTrend.slice(-3).reduce((s, x) => s + x.onTimePct, 0) / 3) * 100,
      ) / 100;
    const avgTime =
      Math.round(
        (monthTrend.slice(-3).reduce((s, x) => s + x.avgTime, 0) / 3) * 10,
      ) / 10;

    return {
      id: `DP-${5000 + i}`,
      name: n,
      city: ["Lisbon", "Porto", "Coimbra", "Braga", "Faro"][i % 5],
      rating: Number((4 + Math.random()).toFixed(2)),
      deliveries,
      onTimePct: onTime,
      avgTime,
      cancelPct: Math.floor(Math.random() * 5),
      earnings,
      lastActive: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24),
      ).toISOString(),
      vehicle: ["Bike", "Scooter", "Car"][i % 3],
      monthTrend,
    } as PartnerSummary;
  });
}
