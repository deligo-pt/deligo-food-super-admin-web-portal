/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { motion } from "framer-motion";

// charts
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Download, TrendingUp, Users, Clock, AlertOctagon } from "lucide-react";

const DELIGO = "#DC3173";

// ---------------------- Types ----------------------
type DailyPoint = { date: string; deliveries: number; earnings: number; avgTime: number };
type Rider = {
  id: string;
  name: string;
  deliveries: number;
  onTimePct: number;
  avgTime: number; // minutes
  cancelRate: number; // pct
  rating: number; // 1-5
  earnings: number;
};

// ---------------------- Component ----------------------
export default function FleetPerformancePage() {
  // filters
  const [range, setRange] = useState<"7" | "30" | "custom">("7");
  const [customStart, setCustomStart] = useState<string>(getISODateDaysAgo(30));
  const [customEnd, setCustomEnd] = useState<string>(getISODateDaysAgo(0));
  const [selectedZone, setSelectedZone] = useState<string | "all">("all");
  const [selectedManager, setSelectedManager] = useState<string | "all">("all");

  // data
  const [daily, setDaily] = useState<DailyPoint[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);

  // drilldown modal state
  const [openDrill, setOpenDrill] = useState(false);
  const [drillRider, setDrillRider] = useState<Rider | null>(null);

  // load mock data
  useEffect(() => {
    setDaily(mockDaily(30));
    setRiders(mockRiders(12));
  }, []);

  // selected date range computed
  const [rangeState, setRangeState] = useState<{ startDate: Date; endDate: Date; dailyFiltered: DailyPoint[] }>({
    startDate: new Date(),
    endDate: new Date(),
    dailyFiltered: daily,
  });
  const { startDate, endDate, dailyFiltered } = rangeState;

  useEffect(() => {
    // compute current time inside effect (impure calls allowed here)
    const now = Date.now();
    let start = new Date();
    let end = new Date();
    if (range === "7") {
      start = new Date(now - 6 * 24 * 3600 * 1000);
    } else if (range === "30") {
      start = new Date(now - 29 * 24 * 3600 * 1000);
    } else {
      start = customStart ? new Date(customStart) : new Date(now - 29 * 24 * 3600 * 1000);
      end = customEnd ? new Date(customEnd) : new Date();
    }
    // normalize end to end of day
    end = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59);

    const filtered = daily.filter((d) => {
      const dt = new Date(d.date);
      return dt >= start && dt <= end;
    });

    setRangeState({ startDate: start, endDate: end, dailyFiltered: filtered });
  }, [range, customStart, customEnd, daily]);

  // KPI summary
  const kpis = useMemo(() => {
    const totalDeliveries = dailyFiltered.reduce((s, d) => s + d.deliveries, 0);
    const totalEarnings = dailyFiltered.reduce((s, d) => s + d.earnings, 0);
    const avgTime = dailyFiltered.length ? Math.round(dailyFiltered.reduce((s, d) => s + d.avgTime, 0) / dailyFiltered.length) : 0;

    // compute on-time % roughly from riders
    const onTimePct = riders.length ? Math.round(riders.reduce((s, r) => s + r.onTimePct, 0) / riders.length) : 0;
    const cancelRate = riders.length ? Number((riders.reduce((s, r) => s + r.cancelRate, 0) / riders.length).toFixed(1)) : 0;

    return {
      totalDeliveries,
      totalEarnings,
      avgTime,
      onTimePct,
      cancelRate,
    };
  }, [dailyFiltered, riders]);

  // leaderboard sorted
  const leaderboard = useMemo(() => [...riders].sort((a, b) => b.deliveries - a.deliveries), [riders]);

  // export CSV
  function exportCSV() {
    const rows = [["date", "deliveries", "earnings", "avgTime"]];
    dailyFiltered.forEach((d) => rows.push([d.date, String(d.deliveries), String(d.earnings), String(d.avgTime)]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fleet_performance_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // on click rider -> open drill
  function openRiderDrill(r: Rider) {
    setDrillRider(r);
    setOpenDrill(true);
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-extrabold mb-6 flex items-center gap-3">
        <TrendingUp className="w-8 h-8" /> Fleet Performance
      </motion.h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={range === "7" ? "default" : "ghost" as any} onClick={() => setRange("7")}>Last 7 days</Button>
          <Button size="sm" variant={range === "30" ? "default" : "ghost" as any} onClick={() => setRange("30")}>Last 30 days</Button>
          <Button size="sm" variant={range === "custom" ? "default" : "ghost" as any} onClick={() => setRange("custom")}>Custom</Button>
        </div>

        {range === "custom" && (
          <div className="flex items-center gap-2">
            <Input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            <Input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
          </div>
        )}

        <select className="px-3 py-2 border rounded-md bg-white" value={selectedZone} onChange={(e) => setSelectedZone(e.target.value)}>
          <option value="all">All Zones</option>
          <option value="Lisbon Central">Lisbon Central</option>
          <option value="Porto Downtown">Porto Downtown</option>
          <option value="Braga West">Braga West</option>
        </select>

        <select className="px-3 py-2 border rounded-md bg-white" value={selectedManager} onChange={(e) => setSelectedManager(e.target.value)}>
          <option value="all">All Managers</option>
          <option value="João Silva">João Silva</option>
          <option value="Maria Fernandes">Maria Fernandes</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4" /> Export CSV</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="p-5">
          <p className="text-xs text-slate-500">Total Deliveries</p>
          <h3 className="text-2xl font-bold mt-1">{kpis.totalDeliveries.toLocaleString()}</h3>
          <p className="text-xs text-slate-500 mt-1">{kpis.totalEarnings.toLocaleString()} € earnings</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">Avg Delivery Time</p>
          <h3 className="text-2xl font-bold mt-1">{kpis.avgTime} min</h3>
          <p className="text-xs text-slate-500 mt-1">On-time {kpis.onTimePct}%</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">Cancel Rate</p>
          <h3 className="text-2xl font-bold mt-1">{kpis.cancelRate}%</h3>
          <p className="text-xs text-slate-500 mt-1">Fleet health</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs text-slate-500">Active Riders</p>
          <h3 className="text-2xl font-bold mt-1">{riders.length}</h3>
          <p className="text-xs text-slate-500 mt-1">Average rating {avgRating(riders)}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="p-4 h-80 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Deliveries & Earnings Trend</h4>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={dailyFiltered} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="deliveries" stroke={DELIGO} strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#2563EB" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 h-80 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Earnings Area (last period)</h4>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={dailyFiltered} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="earnings" stroke="#10B981" fill="#10B981" fillOpacity={0.12} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <Card className="p-4 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Rider Performance (Top 5)</h4>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between p-2 rounded-md bg-slate-50">
                <div>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-slate-500">Deliveries: {r.deliveries} • On-time {r.onTimePct}%</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{r.rating} ⭐</div>
                  <div className="text-xs">€ {r.earnings}</div>
                  <div>
                    <Button size="sm" variant="ghost" onClick={() => openRiderDrill(r)}>View</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Rider Comparison (Deliveries)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={leaderboard.slice(0, 6)} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="deliveries" fill={DELIGO} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-4 bg-white shadow-sm">
          <h4 className="font-semibold mb-2">Order Type Distribution</h4>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={mockOrderTypes()} dataKey="value" nameKey="name" innerRadius={40} outerRadius={60} label>
                {mockOrderTypes().map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={['#60A5FA', '#F97316', DELIGO, '#34D399'][idx % 4]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Heatmap (simple) */}
      <Card className="p-4 mb-6">
        <h4 className="font-semibold mb-3">Peak Hour Heatmap (Orders)</h4>
        <div className="grid grid-cols-12 gap-1 text-xs">
          {Array.from({ length: 24 }).map((_, hour) => {
            const count = Math.floor(Math.random() * 80);
            const intensity = Math.min(1, count / 80);
            const bg = `rgba(220,49,115,${0.08 + intensity * 0.7})`;
            return (
              <div key={hour} className="p-3 text-center rounded" style={{ background: bg }}>{hour}:00</div>
            );
          })}
        </div>
      </Card>

      {/* Leaderboard Table */}
          <Card className="p-6 bg-white shadow-sm rounded-2xl">
  <h4 className="font-semibold text-xl mb-4">Fleet Manager Performance</h4>

  <Table className="table-fixed w-full">
    <TableHead>
      <TableRow className="bg-slate-100/70">
        <TableCell className="w-12 text-center font-semibold">#</TableCell>
        <TableCell className="w-56 font-semibold">Manager</TableCell>
        <TableCell className="w-24 text-center font-semibold">Deliveries</TableCell>
        <TableCell className="w-32 text-center font-semibold">On-time</TableCell>
        <TableCell className="w-28 text-center font-semibold">Avg Time</TableCell>
        <TableCell className="w-28 text-center font-semibold">Cancel %</TableCell>
        <TableCell className="w-32 text-center font-semibold">Earnings</TableCell>
        <TableCell className="w-24 text-right font-semibold">Actions</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {leaderboard.map((r, idx) => (
        <TableRow key={r.id} className="hover:bg-slate-50">
          
          {/* Index */}
          <TableCell className="text-center">{idx + 1}</TableCell>

          {/* Manager */}
          <TableCell className="text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white flex items-center justify-center font-semibold">
                {r.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="font-medium text-slate-800">{r.name}</p>
                <p className="text-xs text-slate-500">Rating: {r.rating} ⭐</p>
              </div>
            </div>
          </TableCell>

          {/* Deliveries */}
          <TableCell className="text-center font-semibold">{r.deliveries}</TableCell>

          {/* On-time */}
          <TableCell className="text-center">
            <p className="font-semibold">{r.onTimePct}%</p>
            <div className="h-2 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${r.onTimePct}%` }}
              />
            </div>
          </TableCell>

          {/* Avg Time */}
          <TableCell className="text-center font-semibold">
            {r.avgTime} min
          </TableCell>

          {/* Cancel Rate */}
          <TableCell className="text-center">
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                r.cancelRate > 2
                  ? "bg-red-100 text-red-600"
                  : "bg-emerald-100 text-emerald-600"
              }`}
            >
              {r.cancelRate}%
            </span>
          </TableCell>

          {/* Earnings */}
          <TableCell className="text-center font-bold text-emerald-600">
            € {r.earnings.toLocaleString()}
          </TableCell>

          {/* Actions */}
          <TableCell className="text-right">
            <Button size="sm" variant="ghost" onClick={() => openRiderDrill(r)}>
              View
            </Button>
          </TableCell>

        </TableRow>
      ))}
    </TableBody>
  </Table>
</Card>




      {/* Drilldown dialog */}
      <Dialog open={openDrill} onOpenChange={() => setOpenDrill(false)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Rider Performance — {drillRider?.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h5 className="font-semibold">KPI</h5>
              {drillRider ? (
                <div className="mt-2 space-y-2">
                  <div>Total Deliveries: <strong>{drillRider.deliveries}</strong></div>
                  <div>On-time: <strong>{drillRider.onTimePct}%</strong></div>
                  <div>Avg Time: <strong>{drillRider.avgTime} min</strong></div>
                  <div>Cancel Rate: <strong>{drillRider.cancelRate}%</strong></div>
                  <div>Rating: <strong>{drillRider.rating}</strong></div>
                  <div>Earnings: <strong>€ {drillRider.earnings}</strong></div>
                </div>
              ) : null}
            </Card>

            <Card className="p-4">
              <h5 className="font-semibold">Recent Trend (last 14 days)</h5>
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={mockDailyForRider()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="deliveries" stroke={DELIGO} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setOpenDrill(false)}>Close</Button>
            <Button style={{ background: DELIGO }} className="ml-2">Export Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------- Helpers / Mocks ----------------------
function getISODateDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function mockDaily(days = 30): DailyPoint[] {
  return Array.from({ length: days }).map((_, i) => {
    const dt = new Date(Date.now() - (days - 1 - i) * 24 * 3600 * 1000);
    return {
      date: dt.toISOString().slice(0, 10),
      deliveries: Math.floor(200 + Math.random() * 200),
      earnings: Math.floor(2000 + Math.random() * 4000),
      avgTime: Math.floor(25 + Math.random() * 10),
    };
  });
}

function mockRiders(count = 10): Rider[] {
  const names = ["João Silva", "Maria Fernandes", "Rui Costa", "Ana Pereira", "Carlos Sousa", "Pedro Alves", "Sofia Gomes", "Miguel Rocha", "Inês Duarte", "Tiago Martins"];
  return Array.from({ length: count }).map((_, i) => {
    const deliveries = Math.floor(200 + Math.random() * 400);
    const onTimePct = Math.floor(80 + Math.random() * 20);
    const cancelRate = Number((Math.random() * 2).toFixed(1));
    const avgTime = Math.floor(20 + Math.random() * 15);
    const rating = Number((4 + Math.random()).toFixed(1));
    const earnings = Math.floor(800 + Math.random() * 2000);
    return {
      id: `R-${1000 + i}`,
      name: names[i % names.length],
      deliveries,
      onTimePct,
      avgTime,
      cancelRate,
      rating,
      earnings,
    };
  });
}

function mockOrderTypes() {
  return [
    { name: "Delivery", value: 5400 },
    { name: "Pickup", value: 2200 },
    { name: "Curbside", value: 900 },
    { name: "Dine-in", value: 400 },
  ];
}

function mockDailyForRider() {
  return Array.from({ length: 14 }).map((_, i) => ({ date: getISODateDaysAgo(13 - i), deliveries: Math.floor(5 + Math.random() * 10) }));
}

function avgRating(riders: Rider[]) {
  if (!riders.length) return "—";
  const total = riders.reduce((s, r) => s + r.rating, 0);
  return (total / riders.length).toFixed(1);
}
