"use client"
import  { useState } from "react";
import { MapPin, Truck, Clock, AlertTriangle,  Download } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type DriverStat = {
  id: string;
  name: string;
  completed: number;
  late: number;
  avgPickupMin: number;
};

const driverData: DriverStat[] = [
  { id: "D-1", name: "João Silva", completed: 124, late: 6, avgPickupMin: 4 },
  { id: "D-2", name: "Ana Costa", completed: 110, late: 14, avgPickupMin: 6 },
  { id: "D-3", name: "Miguel Sousa", completed: 98, late: 3, avgPickupMin: 5 },
  { id: "D-4", name: "Sofia Pereira", completed: 86, late: 8, avgPickupMin: 7 },
];

const hourlyChart = [
  { hour: "00:00", deliveries: 6 },
  { hour: "02:00", deliveries: 4 },
  { hour: "04:00", deliveries: 2 },
  { hour: "06:00", deliveries: 18 },
  { hour: "08:00", deliveries: 60 },
  { hour: "10:00", deliveries: 78 },
  { hour: "12:00", deliveries: 132 },
  { hour: "14:00", deliveries: 160 },
  { hour: "16:00", deliveries: 200 },
  { hour: "18:00", deliveries: 220 },
  { hour: "20:00", deliveries: 180 },
  { hour: "22:00", deliveries: 86 },
];

const slaData = [
  { name: "On-time", value: 84 },
  { name: "Late", value: 12 },
  { name: "Canceled", value: 4 },
];

const COLORS = ["#DC3173", "#f973a8", "#f3f4f6"];

export default function DeliveryInsightsPage() {
  const [range, setRange] = useState("Last 7 days");
  const [driverFilter, setDriverFilter] = useState("all");

  const summary = {
    totalDeliveries: 700,
    onTimePct: 84,
    avgDeliveryMin: 28,
    cancellations: 28,
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Delivery Insights</h1>
            <p className="text-sm text-gray-600 mt-1">Driver performance, SLA, heat zones and hourly load — focused for Portugal.</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#DC3173" }}
            >
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Custom range</option>
            </select>

            <select
              value={driverFilter}
              onChange={(e) => setDriverFilter(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none"
              style={{ borderColor: "#DC3173" }}
            >
              <option value="all">All drivers</option>
              {driverData.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>

            <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-md">
              <Download size={16} />
              <span className="text-sm">Export</span>
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Total Deliveries</h3>
                <p className="text-2xl font-semibold mt-1">{summary.totalDeliveries.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "#DC317311" }}>
                <Truck size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">{range} • Portugal</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">On-time Rate</h3>
                <p className="text-2xl font-semibold mt-1">{summary.onTimePct}%</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "#DC317311" }}>
                <MapPin size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">Good — monitor peak hours</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Avg Delivery Time</h3>
                <p className="text-2xl font-semibold mt-1">{summary.avgDeliveryMin} min</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "#DC317311" }}>
                <Clock size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">Improve pickup times to lower this</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">Cancellations</h3>
                <p className="text-2xl font-semibold mt-1">{summary.cancellations}</p>
              </div>
              <div className="p-3 rounded-lg" style={{ background: "#DC317311" }}>
                <AlertTriangle size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">{(summary.cancellations / Math.max(1, summary.totalDeliveries) * 100).toFixed(1)}% of deliveries</p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Hourly Load</h2>
                <p className="text-sm text-gray-500">Delivery volume by hour — use this to balance driver shifts.</p>
              </div>

              <div className="text-sm text-gray-600">Heat view available</div>
            </div>

            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyChart} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="deliveries" fill="#DC3173" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">Drivers: active</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">Zones: busy</div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">SLA: 84%</div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">SLA Breakdown</h3>
            <div className="h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={slaData} dataKey="value" nameKey="name" innerRadius={36} outerRadius={60} paddingAngle={3}>
                    {slaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[0] }} />
                  <span>On-time</span>
                </div>
                <div>{summary.onTimePct}%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[1] }} />
                  <span>Late</span>
                </div>
                <div>12%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: COLORS[2] }} />
                  <span>Canceled</span>
                </div>
                <div>4%</div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Top Drivers</h3>
            <div className="space-y-3">
              {driverData.map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">{d.name.split(" ")[0][0]}{d.name.split(" ")[1][0]}</div>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">Avg pickup {d.avgPickupMin} min</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">{d.completed} completed • {d.late} late</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Actionable Alerts</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: "#DC3173" }}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="font-medium">High late rate in Braga</p>
                  <p className="text-xs text-gray-500">Late deliveries increased by 22% during dinner hours — consider more drivers or surge pay.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: "#DC3173" }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-medium">Hot zone: central Lisbon</p>
                  <p className="text-xs text-gray-500">Demand concentrated — optimize dispatch and pickup points.</p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div className="mt-1 text-white p-2 rounded-lg" style={{ background: "#DC3173" }}>
                  <Truck size={16} />
                </div>
                <div>
                  <p className="font-medium">Low driver availability</p>
                  <p className="text-xs text-gray-500">Driver supply down 8% on weekends — run targeted incentives.</p>
                </div>
              </li>
            </ul>

            <div className="mt-4">
              <button className="px-4 py-2 rounded-md text-white font-medium shadow" style={{ background: "#DC3173" }}>
                Assign extra drivers
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Delivery Log (sample)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Driver</th>
                  <th className="pb-3">Zone</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">18:23</td>
                  <td className="py-3">#DEL-1023</td>
                  <td className="py-3">João Silva</td>
                  <td className="py-3">Lisbon - Baixa</td>
                  <td className="py-3 text-green-600">Delivered</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">18:19</td>
                  <td className="py-3">#DEL-1022</td>
                  <td className="py-3">Ana Costa</td>
                  <td className="py-3">Porto - Ribeira</td>
                  <td className="py-3 text-red-600">Late</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="py-3">18:05</td>
                  <td className="py-3">#DEL-1021</td>
                  <td className="py-3">Sofia Pereira</td>
                  <td className="py-3">Coimbra - Centro</td>
                  <td className="py-3 text-gray-600">Canceled</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <footer className="mt-6 text-xs text-gray-400">Last updated: Oct 07, 2025 • Data is mocked — connect your delivery logs API for real-time insights.</footer>
      </div>
    </div>
  );
}
