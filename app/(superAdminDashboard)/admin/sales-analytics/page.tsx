"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { BarChart2, Clock, Download, TrendingUp, Users } from "lucide-react";
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

type OrderPoint = {
  date: string;
  orders: number;
  revenue: number;
};

const mockLineData: OrderPoint[] = [
  { date: "2025-10-01", orders: 120, revenue: 980 },
  { date: "2025-10-02", orders: 210, revenue: 1800 },
  { date: "2025-10-03", orders: 170, revenue: 1500 },
  { date: "2025-10-04", orders: 260, revenue: 2200 },
  { date: "2025-10-05", orders: 320, revenue: 3000 },
  { date: "2025-10-06", orders: 280, revenue: 2500 },
  { date: "2025-10-07", orders: 350, revenue: 3400 },
];

const mockBarData = [
  { name: "Lisbon", orders: 420, revenue: 4000 },
  { name: "Porto", orders: 330, revenue: 2800 },
  { name: "Coimbra", orders: 140, revenue: 1200 },
  { name: "Faro", orders: 90, revenue: 800 },
  { name: "Braga", orders: 160, revenue: 1500 },
];

export default function SalesAnalyticsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState("Last 7 days");
  const [metric, setMetric] = useState<"orders" | "revenue">("revenue");

  const primary = "#DC3173";

  const overview = {
    orders: 1840,
    revenue: 15630,
    aov: 8.49,
    avgDeliveryMin: 27,
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="">
        {/* Header */}
        <TitleHeader
          title={t("sales_analytics_nd_insights")}
          subtitle={t("overview_orders_revenue_top_regions")}
        />

        <div className="flex items-center gap-3 mb-6">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{ borderColor: primary }}
          >
            <option>{t("last_24_hours")}</option>
            <option>{t("last_7_days")}</option>
            <option>{t("last_30_days")}</option>
            <option>{t("last_90_days")}</option>
            <option>{t("custom")}</option>
          </select>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-150 shadow-sm ${
                metric === "revenue" ? "bg-white ring-2" : "bg-white/60"
              }`}
              style={
                metric === "revenue"
                  ? {
                      borderColor: primary,
                      boxShadow: `0 6px 18px ${primary}22`,
                    }
                  : undefined
              }
            >
              {t("revenue")}
            </button>
            <button
              onClick={() => setMetric("orders")}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-150 shadow-sm ${
                metric === "orders" ? "bg-white ring-2" : "bg-white/60"
              }`}
              style={
                metric === "orders"
                  ? {
                      borderColor: primary,
                      boxShadow: `0 6px 18px ${primary}22`,
                    }
                  : undefined
              }
            >
              {t("orders")}
            </button>

            <button
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-md transition-shadow text-sm"
              title="Export CSV"
            >
              <Download size={16} />
              <span>{t("export")}</span>
            </button>
          </div>
        </div>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("total_revenue")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  €{overview.revenue.toLocaleString()}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${primary}11` }}
              >
                <TrendingUp size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">
              +12.4% vs {t("previous_period")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("orders")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  {overview.orders.toLocaleString()}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${primary}11` }}
              >
                <BarChart2 size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">
              +9.1% vs {t("previous_period")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">
                  {t("avg_order_value")}
                </h3>
                <p className="text-2xl font-semibold mt-1">
                  €{overview.aov.toFixed(2)}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${primary}11` }}
              >
                <Users size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">
              -1.8% vs {t("previous_period")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">
                  {t("avg_delivery_time")}
                </h3>
                <p className="text-2xl font-semibold mt-1">
                  {overview.avgDeliveryMin} {t("min")}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${primary}11` }}
              >
                <Clock size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">{t("on_track")}</p>
          </div>
        </section>

        {/* Main charts area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {metric === "revenue" ? "Revenue" : "Orders"} {t("over_time")}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {range} • {t("portugal")}
                </p>
              </div>

              <div className="text-sm text-gray-600">{t("live_preview")}</div>
            </div>

            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={mockLineData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={primary}
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("orders")}: {t("total")}
              </div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("revenue")}: {t("gross")}
              </div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("net_after_fees")}
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{t("top_regions")}</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mockBarData}
                  layout="vertical"
                  margin={{ left: 0, right: 10 }}
                >
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar
                    dataKey={metric === "revenue" ? "revenue" : "orders"}
                    fill={primary}
                    radius={[6, 6, 6, 6]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {mockBarData.map((r) => (
                <div
                  key={r.name}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: primary }}
                    />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="text-gray-600">
                    {metric === "revenue" ? `€${r.revenue}` : r.orders}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* Insights / CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">
              {t("acionable_insights")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: primary }}
                >
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="font-medium">{t("weekend_boost_in_porto")}</p>
                  <p className="text-xs text-gray-500">
                    {t("")} 18% on Saturdays — {t("consider_targeted_promos")}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: primary }}
                >
                  <Users size={16} />
                </div>
                <div>
                  <p className="font-medium">{t("new_customers_rising")}</p>
                  <p className="text-xs text-gray-500">
                    {t("acquisition_rate_up")} 9% —{" "}
                    {t("allocate_budget_channels_driving")}
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: primary }}
                >
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium">{t("delivery_time_steedy")}</p>
                  <p className="text-xs text-gray-500">
                    {t("average_delivery_at")} 27 min —{" "}
                    {t("keep_moritoring_peak_hours")}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div
            className="bg-linear-to-br from-white to-white p-5 rounded-2xl shadow-sm flex flex-col justify-between"
            style={{ border: `1px solid ${primary}11` }}
          >
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {t("quick_actions")}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("take_immediate_steps_to_imporve")}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className="px-4 py-2 rounded-md text-white font-medium shadow"
                  style={{ background: primary }}
                >
                  {t("create_promo")}
                </button>
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:shadow-sm">
                  {t("adjust_delivery_zones")}
                </button>
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:shadow-sm">
                  {t("pause_low_performing_areas")}
                </button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">
              Pro tip: link this page to an automated insights engine that
              triggers notifications for anomalies.
            </div>
          </div>
        </section>

        {/* Footer / small KPI table */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">{t("kpi_snapshot")}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-3">{t("metric")}</th>
                  <th className="pb-3">{t("value")}</th>
                  <th className="pb-3">{t("change")}</th>
                  <th className="pb-3">{t("notes")}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">{t("gross_revenue")}</td>
                  <td className="py-3">€{overview.revenue.toLocaleString()}</td>
                  <td className="py-3 text-green-600">+12.4%</td>
                  <td className="py-3 text-gray-500">
                    {t("net_of_promotions")}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">{t("total_orders")}</td>
                  <td className="py-3">{overview.orders.toLocaleString()}</td>
                  <td className="py-3 text-green-600">+9.1%</td>
                  <td className="py-3 text-gray-500">{t("peak_at")} 18:00</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">{t("avg_order_value")}</td>
                  <td className="py-3">€{overview.aov.toFixed(2)}</td>
                  <td className="py-3 text-red-600">-1.8%</td>
                  <td className="py-3 text-gray-500">
                    {t("test_bundle_pricing")}
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">{t("avg_delivery_time")}</td>
                  <td className="py-3">{overview.avgDeliveryMin} min</td>
                  <td className="py-3 text-green-600">-4.2%</td>
                  <td className="py-3 text-gray-500">
                    {t("imporving_routing")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 text-xs text-gray-400">
          Last updated: Oct 07, 2025 • Data is mocked — connect your analytics
          API for real numbers.
        </footer>
      </div>
    </div>
  );
}
