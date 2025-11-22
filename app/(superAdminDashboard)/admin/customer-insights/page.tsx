"use client"
import  { useState } from "react";
import { Users, UserPlus, Clock, TrendingUp, Heart, Download, Mail, Smartphone, MapPin } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";



const COLORS = ["#DC3173", "#fda4c8", "#f3f4f6"]; 
const growthData = [
  { month: "Jan", newUsers: 320, returning: 210 },
  { month: "Feb", newUsers: 380, returning: 260 },
  { month: "Mar", newUsers: 520, returning: 300 },
  { month: "Apr", newUsers: 610, returning: 360 },
  { month: "May", newUsers: 700, returning: 420 },
  { month: "Jun", newUsers: 760, returning: 460 },
];

const deviceData = [
  { name: "Mobile", value: 78 },
  { name: "Desktop", value: 16 },
  { name: "Tablet", value: 6 },
];

const locationData = [
  { zone: "Lisbon", customers: 2400 },
  { zone: "Porto", customers: 1780 },
  { zone: "Coimbra", customers: 760 },
  { zone: "Braga", customers: 980 },
  { zone: "Faro", customers: 630 },
];

export default function CustomerInsightsPage() {
  const [range, setRange] = useState("Last 30 days");
  const primary = "#DC3173";

  const summary = {
    totalCustomers: 14280,
    newCustomers: 760,
    returning: 4600,
    avgOrders: 3.4,
    churnRate: 6.2,
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Customer Insights</h1>
            <p className="text-sm text-gray-600 mt-1">Customer engagement, loyalty, device usage, and geographic distribution — Portugal.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ borderColor: primary }}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Custom range</option>
            </select>

            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-md transition">
              <Download size={16} />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </header>

        {/* Overview cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {/* Total customers */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Total Customers</h3>
                <p className="text-2xl font-semibold mt-1">{summary.totalCustomers.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <Users size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Portugal • {range}</p>
          </div>

          {/* New customers */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">New Customers</h3>
                <p className="text-2xl font-semibold mt-1">{summary.newCustomers}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <UserPlus size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">+18% from last period</p>
          </div>

          {/* Returning */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Returning Users</h3>
                <p className="text-2xl font-semibold mt-1">{summary.returning}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <Heart size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">Loyalty improving</p>
          </div>

          {/* Avg orders */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Avg Orders / User</h3>
                <p className="text-2xl font-semibold mt-1">{summary.avgOrders.toFixed(1)}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <Clock size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Consistent</p>
          </div>

          {/* Churn rate */}
          <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Churn Rate</h3>
                <p className="text-2xl font-semibold mt-1">{summary.churnRate}%</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: `${primary}11` }}>
                <TrendingUp size={28} color={primary} />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">Track low‑activity users</p>
          </div>
        </section>

        {/* Growth + Device usage */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-1">User Growth</h2>
            <p className="text-sm text-gray-500 mb-4">New vs Returning users — growth trend</p>

            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="newUsers" stroke={primary} strokeWidth={3} />
                  <Line type="monotone" dataKey="returning" stroke="#f973a8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Device Usage</h3>
            <div className="h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deviceData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={60} paddingAngle={3}>
                    {deviceData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1 text-sm">
              {deviceData.map((d, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    {d.name}
                  </div>
                  <span>{d.value}%</span>
                </div>
              ))}
            </div>
          </aside>
        </section>

        {/* Locations + Engagement */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Top Customer Zones</h3>
            <div className="space-y-3 text-sm">
              {locationData.map((z) => (
                <div key={z.zone} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin size={18} color={primary} />
                    <span className="font-medium">{z.zone}</span>
                  </div>
                  <span className="text-gray-600">{z.customers.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Engagement Highlights</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="p-2 text-white rounded-lg" style={{ background: primary }}>
                  <Heart size={16} />
                </div>
                <div>
                  <p className="font-medium">High weekend activity</p>
                  <p className="text-xs text-gray-500">Peak ordering time is Saturday 19:00 — push promos.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2 text-white rounded-lg" style={{ background: primary }}>
                  <Smartphone size={16} />
                </div>
                <div>
                  <p className="font-medium">Mobile‑first customers</p>
                  <p className="text-xs text-gray-500">78% of orders come from mobile — optimize UX.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="p-2 text-white rounded-lg" style={{ background: primary }}>
                  <Mail size={16} />
                </div>
                <div>
                  <p className="font-medium">Re‑engagement potential</p>
                  <p className="text-xs text-gray-500">Email reactivation campaigns show 12% CTR.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Basic customer table */}
        <section className="bg-white rounded-2xl p-5 shadow-sm mb-8">
          <h3 className="text-lg font-semibold mb-3">Recent Customers (sample)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Joined</th>
                  <th className="pb-3">Orders</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50 transition">
                  <td className="py-3">Daniel Martins</td>
                  <td className="py-3">2025-03-12</td>
                  <td className="py-3">6</td>
                  <td className="py-3">Lisbon</td>
                  <td className="py-3 text-green-600">Active</td>
                </tr>

                <tr className="hover:bg-gray-50 transition">
                  <td className="py-3">Ricardo Silva</td>
                  <td className="py-3">2025-03-10</td>
                  <td className="py-3">0</td>
                  <td className="py-3">Porto</td>
                  <td className="py-3 text-red-600">Inactive</td>
                </tr>

                <tr className="hover:bg-gray-50 transition">
                  <td className="py-3">Ana Oliveira</td>
                  <td className="py-3">2025-03-09</td>
                  <td className="py-3">3</td>
                  <td className="py-3">Faro </td>
                <td className="py-3 text-gray-600">Pending</td>
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

