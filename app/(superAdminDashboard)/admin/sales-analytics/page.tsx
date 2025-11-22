"use client"
import  { useState } from "react";
import { TrendingUp, Users, Clock, BarChart2, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  CartesianGrid,
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
  const [range, setRange] = useState("Last 7 days");
  const [metric, setMetric] = useState<"orders" | "revenue">("revenue");

  const primary = "#DC3173";
  const accent = "#ff8fb2"; // soft accent derived from primary

  const overview = {
    orders: 1840,
    revenue: 15630,
    aov: 8.49,
    avgDeliveryMin: 27,
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sales Analytics & Insights</h1>
            <p className="text-sm text-gray-600 mt-1">Overview of orders, revenue and top regions — tailored for Portugal (Deligo).</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ borderColor: primary }}
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMetric("revenue")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-150 shadow-sm ${
                  metric === "revenue" ? "bg-white ring-2" : "bg-white/60"
                }`}
                style={ metric === "revenue" ? { borderColor: primary, boxShadow: `0 6px 18px ${primary}22` } : undefined }
              >
                Revenue
              </button>
              <button
                onClick={() => setMetric("orders")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-shadow duration-150 shadow-sm ${
                  metric === "orders" ? "bg-white ring-2" : "bg-white/60"
                }`}
                style={ metric === "orders" ? { borderColor: primary, boxShadow: `0 6px 18px ${primary}22` } : undefined }
              >
                Orders
              </button>

              <button
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-md transition-shadow text-sm"
                title="Export CSV"
              >
                <Download size={16} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-semibold mt-1">€{overview.revenue.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <TrendingUp size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">+12.4% vs previous period</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Orders</h3>
                <p className="text-2xl font-semibold mt-1">{overview.orders.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <BarChart2 size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">+9.1% vs previous period</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Avg Order Value</h3>
                <p className="text-2xl font-semibold mt-1">€{overview.aov.toFixed(2)}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <Users size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">-1.8% vs previous period</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Avg Delivery Time</h3>
                <p className="text-2xl font-semibold mt-1">{overview.avgDeliveryMin} min</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <Clock size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">On track</p>
          </div>
        </section>

        {/* Main charts area */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{metric === "revenue" ? "Revenue" : "Orders"} over time</h2>
                <p className="text-sm text-gray-500 mt-1">{range} • Portugal</p>
              </div>

              <div className="text-sm text-gray-600">Live preview</div>
            </div>

            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockLineData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
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
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">Orders: total</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">Revenue: gross</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">Net: after fees</div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Top Regions</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockBarData} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey={metric === "revenue" ? "revenue" : "orders"} fill={primary} radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {mockBarData.map((r) => (
                <div key={r.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full" style={{ background: primary }} />
                    <span className="font-medium">{r.name}</span>
                  </div>
                  <div className="text-gray-600">{metric === "revenue" ? `€${r.revenue}` : r.orders}</div>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* Insights / CTA */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Actionable Insights</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: primary }}>
                  <TrendingUp size={16} />
                </div>
                <div>
                  <p className="font-medium">Weekend boost in Porto</p>
                  <p className="text-xs text-gray-500">Orders increase by 18% on Saturdays — consider targeted promos.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: primary }}>
                  <Users size={16} />
                </div>
                <div>
                  <p className="font-medium">New customers rising</p>
                  <p className="text-xs text-gray-500">Acquisition rate up 9% — allocate budget to channels driving sign-ups.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: primary }}>
                  <Clock size={16} />
                </div>
                <div>
                  <p className="font-medium">Delivery time steady</p>
                  <p className="text-xs text-gray-500">Average delivery at 27 min — keep monitoring peak hours.</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-white to-white p-5 rounded-2xl shadow-sm flex flex-col justify-between" style={{ border: `1px solid ${primary}11` }}>
            <div>
              <h3 className="text-lg font-semibold mb-2">Quick Actions</h3>
              <p className="text-sm text-gray-500 mb-4">Take immediate steps to improve conversion and driver availability.</p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="px-4 py-2 rounded-md text-white font-medium shadow" style={{ background: primary }}>
                  Create Promo
                </button>
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:shadow-sm">Adjust Delivery Zones</button>
                <button className="px-4 py-2 rounded-md border border-gray-200 hover:shadow-sm">Pause Low-Performing Areas</button>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">Pro tip: link this page to an automated insights engine that triggers notifications for anomalies.</div>
          </div>
        </section>

        {/* Footer / small KPI table */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">KPI Snapshot</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-3">Metric</th>
                  <th className="pb-3">Value</th>
                  <th className="pb-3">Change</th>
                  <th className="pb-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">Gross Revenue</td>
                  <td className="py-3">€{overview.revenue.toLocaleString()}</td>
                  <td className="py-3 text-green-600">+12.4%</td>
                  <td className="py-3 text-gray-500">Net of promotions</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">Total Orders</td>
                  <td className="py-3">{overview.orders.toLocaleString()}</td>
                  <td className="py-3 text-green-600">+9.1%</td>
                  <td className="py-3 text-gray-500">Peak at 18:00</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">Avg Order Value</td>
                  <td className="py-3">€{overview.aov.toFixed(2)}</td>
                  <td className="py-3 text-red-600">-1.8%</td>
                  <td className="py-3 text-gray-500">Test bundle pricing</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">Avg Delivery Time</td>
                  <td className="py-3">{overview.avgDeliveryMin} min</td>
                  <td className="py-3 text-green-600">-4.2%</td>
                  <td className="py-3 text-gray-500">Improved routing</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 text-xs text-gray-400">Last updated: Oct 07, 2025 • Data is mocked — connect your analytics API for real numbers.</footer>
      </div>
    </div>
  );
}
