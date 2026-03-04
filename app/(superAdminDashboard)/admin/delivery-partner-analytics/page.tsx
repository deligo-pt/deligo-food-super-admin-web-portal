/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import TitleHeader from "@/components/TitleHeader/TitleHeader";
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
import { useTranslation } from "@/hooks/use-translation";
import { motion } from "framer-motion";
import {
  Activity,
  Clock,
  Download,
  Eye,
  TrendingUp,
  Users,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
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

// Deligo color
const DELIGO = "#DC3173";
// use uploaded file path (dev note: transform to CDN in prod)
const SAMPLE_AVATAR = "/mnt/data/Screenshot from 2025-11-21 00-13-57.png";

// ---------------- Types ----------------
type MonthPoint = {
  month: string;
  deliveries: number;
  revenue: number;
  growthPct?: number;
};
type Partner = {
  id: string;
  name: string;
  city: string;
  rating: number;
  deliveries: number;
  revenue: number;
  avgTime: number;
  onTimePct: number;
  hourlyHeat: number[]; // 24 values for heatmap
  monthly: MonthPoint[]; // 12 months
  lastActive?: string;
};

// ---------------- Component ----------------
export default function DeliveryPartnerAnalyticsPage() {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [range, setRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");
  const [selected, setSelected] = useState<Partner | null>(null);
  const [exporting, setExporting] = useState(false);
  const [heatScale, setHeatScale] = useState(1); // for visualization intensity

  useEffect(() => {
    setPartners(mockPartners());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return partners.filter((p) =>
      q ? `${p.name} ${p.city} ${p.id}`.toLowerCase().includes(q) : true,
    );
  }, [partners, query]);

  // Aggregated monthly revenue across filtered partners
  const aggregatedMonths = useMemo(() => {
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
        const deliveries = filtered.reduce(
          (s, p) => s + (p.monthly[i]?.deliveries || 0),
          0,
        );
        const revenue = filtered.reduce(
          (s, p) => s + (p.monthly[i]?.revenue || 0),
          0,
        );
        const prev =
          i > 0
            ? filtered.reduce((s, p) => s + (p.monthly[i - 1]?.revenue || 0), 0)
            : 0;
        const growth = prev
          ? Math.round(((revenue - prev) / prev) * 10000) / 100
          : 0;
        return { month: m, deliveries, revenue, growthPct: growth };
      })
      .slice(-12);
  }, [filtered]);

  // KPI totals (based on range simplified client-side)
  const totals = useMemo(() => {
    const totalDeliveries = filtered.reduce((s, p) => s + p.deliveries, 0);
    const totalRevenue = filtered.reduce((s, p) => s + p.revenue, 0);
    const avgOnTime = filtered.length
      ? Math.round(
          (filtered.reduce((s, p) => s + p.onTimePct, 0) / filtered.length) *
            100,
        ) / 100
      : 0;
    return { totalDeliveries, totalRevenue, avgOnTime };
  }, [filtered]);

  // Export CSV / PDF helpers
  function exportCSV() {
    const head = [
      "ID",
      "Name",
      "City",
      "Deliveries",
      "Revenue",
      "AvgTime",
      "OnTime%",
    ];
    const rows = filtered.map((p) => [
      p.id,
      p.name,
      p.city,
      p.deliveries,
      p.revenue,
      p.avgTime,
      p.onTimePct,
    ]);
    const csv = [head, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `delivery_partners_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const el = document.getElementById("analytics-print-area");
      if (!el) return window.print();
      const canvas = await html2canvas(el, { scale: 2 });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const w = pdf.internal.pageSize.getWidth();
      const h = (canvas.height * w) / canvas.width;
      pdf.addImage(img, "PNG", 0, 0, w, h);
      pdf.save(
        `delivery_partner_analytics_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } catch (e) {
      // fallback

      console.warn("PDF failed", e);
      window.print();
    } finally {
      setExporting(false);
    }
  }

  // Quick helper for heatmap color
  function heatColor(value: number) {
    const v = Math.min(1, value / (10 * heatScale)); // normalize
    // gradient from white -> DELIGO
    const r1 = 220,
      g1 = 49,
      b1 = 115; // DELIGO hex DC3173
    const r = Math.round(255 - (255 - r1) * v);
    const g = Math.round(255 - (255 - g1) * v);
    const b = Math.round(255 - (255 - b1) * v);
    return `rgb(${r},${g},${b})`;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <TitleHeader
            title={t("delivery_partner_analytics")}
            subtitle={t("kpi_dashboard_trends_heatmap")}
          />

          <div className="flex items-center gap-2">
            <Input
              placeholder={t("search_partner_city")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex items-center gap-2 bg-white rounded border px-2 py-1">
              <button
                className={`px-2 py-1 rounded ${range === "7d" ? "bg-white border" : ""}`}
                onClick={() => setRange("7d")}
              >
                {t("d7")}
              </button>
              <button
                className={`px-2 py-1 rounded ${range === "30d" ? "bg-white border" : ""}`}
                onClick={() => setRange("30d")}
              >
                {t("d30")}
              </button>
              <button
                className={`px-2 py-1 rounded ${range === "90d" ? "bg-white border" : ""}`}
                onClick={() => setRange("90d")}
              >
                {t("d90")}
              </button>
              <button
                className={`px-2 py-1 rounded ${range === "12m" ? "bg-white border" : ""}`}
                onClick={() => setRange("12m")}
              >
                {t("m12")}
              </button>
            </div>

            <Button
              variant="outline"
              onClick={exportCSV}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {t("csv")}
            </Button>
            <Button
              onClick={exportPDF}
              className="flex items-center gap-2"
              disabled={exporting}
            >
              <Download className="w-4 h-4" />
              {t("pdf")}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* PRINTABLE AREA */}
      <div id="analytics-print-area" className="space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KpiCard
            title={t("partners")}
            value={filtered.length.toString()}
            icon={<Users />}
            accent={DELIGO}
          />
          <KpiCard
            title={t("total_deliveries")}
            value={totals.totalDeliveries.toLocaleString()}
            icon={<TrendingUp />}
            accent="#06b6d4"
          />
          <KpiCard
            title={t("total_revenue")}
            value={`€ ${totals.totalRevenue.toLocaleString()}`}
            icon={<Activity />}
            accent="#10b981"
          />
          <KpiCard
            title={t("avg_on_time")}
            value={`${totals.avgOnTime}%`}
            icon={<Clock />}
            accent="#f59e0b"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Growth Line */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{t("revenue_growth")}</h4>
                <p className="text-xs text-slate-500">
                  {t("monthly_revenue_aggregated")}
                </p>
              </div>
              <div className="text-xs text-slate-400">
                {t("range")}: {range}
              </div>
            </div>

            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={aggregatedMonths}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(val: any, name: string) =>
                      name === "revenue"
                        ? `€ ${Number(val).toLocaleString()}`
                        : val
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke={DELIGO}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="deliveries"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Top Partners Bar */}
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{t("top_partners_revenue")}</h4>
                <p className="text-xs text-slate-500">Top 6 by revenue</p>
              </div>
            </div>

            <div className="h-56 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[...filtered]
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 6)
                    .map((p) => ({ name: p.name, revenue: p.revenue }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip
                    formatter={(v: any) => `€ ${Number(v).toLocaleString()}`}
                  />
                  <Bar dataKey="revenue" fill={DELIGO} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Small summary + controls */}
          <Card className="p-4 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold">{t("controls_heatmap_scale")}</h4>
              <p className="text-xs text-slate-500">
                {t("adjust_heat_intensity_peak_hour")}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-xs text-slate-500">
                {t("heat_intensity")}
              </label>
              <input
                type="range"
                min={0.5}
                max={3}
                step={0.1}
                value={heatScale}
                onChange={(e) => setHeatScale(Number(e.target.value))}
              />
              <Separator className="my-3" />
              <div className="text-sm text-slate-600">{t("quick_actions")}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => setSelected(filtered[0] ?? null)}
                >
                  {t("open_top")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.alert("Export schedule (mock)")}
                >
                  {t("schedule_export")}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Heatmap (peak ordering hours) */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold">
                {t("peak_ordering_hours_heatmap")}
              </h4>
              <p className="text-xs text-slate-500">
                {t("aggregated_across_filtered_partners")}
              </p>
            </div>

            <div className="text-xs text-slate-500">
              {t("scale")} {heatScale.toFixed(1)}x
            </div>
          </div>

          <div className="mt-4">
            {/* compute aggregate hourly */}
            <Heatmap
              aggregated={(function () {
                const hours = new Array(24).fill(0);
                filtered.forEach((p) =>
                  p.hourlyHeat.forEach((v, i) => (hours[i] += v)),
                );
                return hours;
              })()}
              heatColor={(v) => heatColor(v)}
              onCellClick={(hour) => {
                // open modal showing peak hour details (mock)
                if (!filtered.length) return;
                const best = filtered
                  .sort(
                    (a, b) =>
                      (b.hourlyHeat[hour] || 0) - (a.hourlyHeat[hour] || 0),
                  )
                  .slice(0, 6);
                // construct a quick partner object for display (open first)
                setSelected({ ...best[0] });
              }}
            />
          </div>
        </Card>

        {/* Leaderboard / Partners list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-4 col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">{t("top_partners_leaderboard")}</h4>
              <div className="text-xs text-slate-500">
                {t("sorted_by_deliveries")}
              </div>
            </div>

            <div className="space-y-3">
              {[...filtered]
                .sort((a, b) => b.deliveries - a.deliveries)
                .slice(0, 10)
                .map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-3 bg-white rounded-xl border flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={SAMPLE_AVATAR} />
                        <AvatarFallback>
                          {p.name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 truncate">
                          {p.city} • {p.id}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-500">
                        {t("deliveries")}
                      </div>
                      <div className="font-bold text-lg">{p.deliveries}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        € {p.revenue.toLocaleString()}
                      </div>
                      <div className="mt-2 flex items-center gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(p)}
                        >
                          <Eye className="w-4 h-4" />
                          {t("view")}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </Card>

          {/* Small metrics card */}
          <Card className="p-4">
            <h4 className="font-semibold mb-2">{t("quick_insights")}</h4>
            <div className="text-sm text-slate-600 space-y-2">
              <div>
                {t("total_partners")}: <strong>{filtered.length}</strong>
              </div>
              <div>
                {t("avg_revenue_per_partner")}:{" "}
                <strong>
                  €{Math.round(totals.totalRevenue / (filtered.length || 1))}
                </strong>
              </div>
              <div>
                {t("peak_hour_approx")}:{" "}
                <strong>
                  {(function () {
                    const hours = new Array(24).fill(0);
                    filtered.forEach((p) =>
                      p.hourlyHeat.forEach((v, i) => (hours[i] += v)),
                    );
                    const h = hours.indexOf(Math.max(...hours));
                    return `${h}:00`;
                  })()}
                </strong>
              </div>
            </div>

            <Separator className="my-3" />
            <div className="flex flex-col gap-2">
              <Button onClick={() => exportCSV()} variant="outline">
                {t("export_csv")}
              </Button>
              <Button
                onClick={() => exportPDF()}
                style={{ background: DELIGO }}
              >
                {t("export_pdf")}
              </Button>
            </div>
          </Card>
        </div>
      </div>

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
              {t("monthly_trend_hourly_heatmap")}
            </SheetDescription>
          </SheetHeader>

          {selected && (
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="col-span-2">
                <div className="flex gap-4 items-center mb-3">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={SAMPLE_AVATAR} />
                    <AvatarFallback>
                      {selected.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selected.name}</h3>
                    <div className="text-sm text-slate-500">
                      {selected.city} • {t("rating")}:{" "}
                      <strong>{selected.rating} ⭐</strong>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {t("last_active")}: {selected.lastActive ?? "—"}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    {t("monthly_deliveries_revenue")}
                  </h4>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selected.monthly}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(v: any, name: string) =>
                            name === "revenue"
                              ? `€ ${Number(v).toLocaleString()}`
                              : v
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke={DELIGO}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="deliveries"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">
                    {t("hourly_activity_heatmap")}
                  </h4>
                  <div className="grid grid-cols-6 gap-2">
                    {selected.hourlyHeat.map((v, i) => (
                      <div
                        key={i}
                        className="p-2 rounded text-xs text-center"
                        style={{
                          background: heatColor(v / 1.2),
                          color: v > 5 ? "white" : "#0f172a",
                        }}
                      >
                        <div className="font-semibold">{i}:00</div>
                        <div className="text-xs">
                          {v} {t("orders")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="mt-4">
                  <h4 className="font-semibold mb-2">{t("recent_activity")}</h4>
                  <ul className="space-y-2 text-sm">
                    <li>
                      • {t("completed")} <strong>{selected.deliveries}</strong>{" "}
                      {t("deliveries_this_range")}
                    </li>
                    <li>
                      • {"avg_time"}:{" "}
                      <strong>
                        {selected.avgTime} {t("min")}
                      </strong>
                    </li>
                    <li>
                      • {t("on_time")}: <strong>{selected.onTimePct}%</strong>
                    </li>
                    <li>
                      • {t("revenue")}:{" "}
                      <strong>€{selected.revenue.toLocaleString()}</strong>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-span-1 space-y-4">
                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("deliveries")}</p>
                  <h3 className="text-2xl font-bold">{selected.deliveries}</h3>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("revenue")}</p>
                  <h3 className="text-2xl font-bold">
                    € {selected.revenue.toLocaleString()}
                  </h3>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-slate-500">{t("on_time")} %</p>
                  <h3 className="text-2xl font-bold">{selected.onTimePct}%</h3>
                </Card>

                <div className="space-y-2">
                  <Button
                    className="w-full"
                    style={{ background: DELIGO }}
                    onClick={() => alert("Open message dialog (mock)")}
                  >
                    {t("message_partner")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => alert("Open payout history (mock)")}
                  >
                    {t("payout_history")}
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

// ---------------- Presentational components ----------------
function KpiCard({
  title,
  value,
  icon,
  accent = DELIGO,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
  accent?: string;
}) {
  return (
    <Card className="p-4 flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-900">{value}</h3>
      </div>
      <div className="p-3 rounded-xl" style={{ background: `${accent}20` }}>
        <div style={{ color: accent }}>{icon}</div>
      </div>
    </Card>
  );
}

/** Heatmap: A small grid representing 24-hours */
function Heatmap({
  aggregated,
  heatColor,
  onCellClick,
}: {
  aggregated: number[];
  heatColor: (v: number) => string;
  onCellClick: (hour: number, total: number) => void;
}) {
  const max = Math.max(...aggregated, 1);
  return (
    <div>
      <div className="grid grid-cols-6 gap-2">
        {aggregated.map((val, i) => {
          const color = heatColor(val / (max || 1));
          return (
            <button
              key={i}
              onClick={() => onCellClick(i, val)}
              className="p-3 rounded text-center"
              style={{ background: color }}
            >
              <div className="font-semibold">{i}:00</div>
              <div className="text-xs text-slate-800">{val}</div>
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        Click a cell to drill into partners for that hour.
      </div>
    </div>
  );
}

// heatColor helper for page-level usage
// function heatColor(value: number, scale = 1) {
//   const v = Math.min(1, value * scale);
//   const r1 = 220,
//     g1 = 49,
//     b1 = 115;
//   const r = Math.round(255 - (255 - r1) * v);
//   const g = Math.round(255 - (255 - g1) * v);
//   const b = Math.round(255 - (255 - b1) * v);
//   return `rgb(${r},${g},${b})`;
// }

// ---------------- Mock data helpers ----------------
function monthsTemplate() {
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
    revenue: Math.floor(4000 + Math.random() * 12000),
  }));
}
function mockPartners(): Partner[] {
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
    const monthly = monthsTemplate();
    const hourly = Array.from({ length: 24 }).map(() =>
      Math.floor(Math.random() * 15),
    );
    const deliveries = monthly.slice(-3).reduce((s, x) => s + x.deliveries, 0);
    const revenue = monthly.slice(-3).reduce((s, x) => s + x.revenue, 0);
    const onTime = Math.floor(75 + Math.random() * 20);
    const avgTime = Math.floor(20 + Math.random() * 20);
    return {
      id: `DP-${5000 + i}`,
      name: n,
      city: ["Lisbon", "Porto", "Coimbra", "Braga", "Faro"][i % 5],
      rating: Number((4 + Math.random()).toFixed(2)),
      deliveries,
      revenue,
      avgTime,
      onTimePct: onTime,
      hourlyHeat: hourly,
      monthly,
      lastActive: new Date(
        Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24),
      ).toISOString(),
    };
  });
}
