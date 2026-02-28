"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { ChevronDown, ChevronUp, Download, Flame, Timer } from "lucide-react";
import { useState } from "react";
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

const PRIMARY = "#DC3173";

// Mock hourly order distribution
const hourlyData = [
  { hour: "00", orders: 120 },
  { hour: "01", orders: 80 },
  { hour: "02", orders: 60 },
  { hour: "03", orders: 40 },
  { hour: "04", orders: 30 },
  { hour: "05", orders: 45 },
  { hour: "06", orders: 110 },
  { hour: "07", orders: 180 },
  { hour: "08", orders: 310 },
  { hour: "09", orders: 420 },
  { hour: "10", orders: 520 },
  { hour: "11", orders: 620 },
  { hour: "12", orders: 880 },
  { hour: "13", orders: 760 },
  { hour: "14", orders: 680 },
  { hour: "15", orders: 710 },
  { hour: "16", orders: 790 },
  { hour: "17", orders: 870 },
  { hour: "18", orders: 1040 },
  { hour: "19", orders: 1180 },
  { hour: "20", orders: 1320 },
  { hour: "21", orders: 980 },
  { hour: "22", orders: 740 },
  { hour: "23", orders: 310 },
];

// Weekday peak distribution
const weekdayData = [
  { day: "Mon", value: 6200 },
  { day: "Tue", value: 6800 },
  { day: "Wed", value: 7100 },
  { day: "Thu", value: 7600 },
  { day: "Fri", value: 9800 },
  { day: "Sat", value: 11300 },
  { day: "Sun", value: 8400 },
];

export default function PeakHoursAnalysisPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState("Last 7 days");
  const [expanded, setExpanded] = useState(false);

  const bestHour = hourlyData.reduce((max, h) =>
    h.orders > max.orders ? h : max,
  );
  const worstHour = hourlyData.reduce((min, h) =>
    h.orders < min.orders ? h : min,
  );

  function exportCSV() {
    const headers = ["Hour", "Orders"];
    const rows = hourlyData.map((h) => [h.hour, h.orders]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "peak_hours.csv";
    a.click();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="">
        {/* Header */}
        <TitleHeader
          title={t("peak_hours_analysis")}
          subtitle={t("real_time_demand_spikes_hourly_order")}
        />

        <div className="flex items-center gap-3 mb-6">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 rounded-md border text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{ borderColor: PRIMARY }}
          >
            <option>{t("last_7_days")}</option>
            <option>{t("last_30_days")}</option>
            <option>{t("last_90_days")}</option>
            <option>{t("current_week")}</option>
          </select>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-md bg-white text-sm border shadow-sm hover:shadow transition"
          >
            <Download size={16} /> {t("export")}
          </button>
        </div>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("peak_hour")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  {bestHour.hour}:00
                </p>
                <p className="text-xs text-gray-500">
                  {bestHour.orders} {t("orders")}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${PRIMARY}11` }}
              >
                <Flame color={PRIMARY} size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("lowest_hour")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  {worstHour.hour}:00
                </p>
                <p className="text-xs text-gray-500">
                  {worstHour.orders} {t("orders")}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${PRIMARY}11` }}
              >
                <Timer color={PRIMARY} size={26} />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition">
            <div>
              <h3 className="text-sm text-gray-500">{t("most_active_day")}</h3>
              <p className="text-2xl font-semibold mt-1">Saturday</p>
              <p className="text-xs text-gray-500">11.3k orders</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl shadow hover:shadow-md transition">
            <div>
              <h3 className="text-sm text-gray-500">{t("weekly_volume")}</h3>
              <p className="text-2xl font-semibold mt-1">52.4k</p>
              <p className="text-xs text-gray-500">
                {t("total_orders_this_week")}
              </p>
            </div>
          </div>
        </section>

        {/* Hourly Line Chart */}
        <section className="bg-white p-5 rounded-2xl shadow mb-6">
          <h2 className="font-semibold text-lg mb-1">
            {t("hourly_order_flow")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("shows_which_hours_experience_maximum_demand")}
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke={PRIMARY}
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Weekday Bar Chart */}
        <section className="bg-white p-5 rounded-2xl shadow mb-6">
          <h2 className="font-semibold text-lg mb-1">
            {t("demand_by_day_of_week")}
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {t("average_total_daily_order_volume")}
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill={PRIMARY} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Expandable Insights */}
        <section className="bg-white p-5 rounded-2xl shadow mb-8">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="font-semibold text-lg">
              {t("ai_generated_insights")}
            </h3>
            {expanded ? <ChevronUp /> : <ChevronDown />}
          </button>

          {expanded && (
            <div className="mt-4 text-sm text-gray-700 space-y-3 animate-fadeIn">
              <p>
                • <span className="font-semibold">20:00–21:00</span> is the
                strongest demand window. Promotions placed 30 minutes before
                this spike historically perform 16% better.
              </p>
              <p>
                • Morning mini‑spike at{" "}
                <span className="font-semibold">10:00–11:00</span> is driven by
                office deliveries.
              </p>
              <p>
                • Lowest engagement at{" "}
                <span className="font-semibold">03:00–05:00</span>. Ideal window
                for maintenance.
              </p>
              <p>
                • Fridays and Saturdays show significantly higher volatility.
              </p>
            </div>
          )}
        </section>

        <footer className="mt-6 text-xs text-gray-400 text-center pb-10">
          Last updated: Oct 07, 2025 — mock data for demo. Connect your
          analytics API for real values.
        </footer>
      </div>
    </div>
  );
}
