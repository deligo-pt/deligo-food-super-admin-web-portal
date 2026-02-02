"use client";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { useTranslation } from "@/hooks/use-translation";
import { AlertTriangle, Clock, Download, MapPin, Truck } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
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
  const { t } = useTranslation();
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
        <TitleHeader
          title={t("delivery_insights")}
          subtitle={t("driver_performance_sla_heat_zones")}
        />

        <div className="flex items-center gap-3 mb-6">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
            style={{ borderColor: "#DC3173" }}
          >
            <option>{t("last_24_hours")}</option>
            <option>{t("last_7_days")}</option>
            <option>{t("last_30_days")}</option>
            <option>{t("custom")}</option>
          </select>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none"
            style={{ borderColor: "#DC3173" }}
          >
            <option value="all">{t("all_drivers")}</option>
            {driverData.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border border-gray-200 hover:shadow-md">
            <Download size={16} />
            <span className="text-sm">{t("export")}</span>
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">
                  {t("total_deliveries")}
                </h3>
                <p className="text-2xl font-semibold mt-1">
                  {summary.totalDeliveries.toLocaleString()}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: "#DC317311" }}
              >
                <Truck size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {range} • {t("portugal")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("on_time_rate")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  {summary.onTimePct}%
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: "#DC317311" }}
              >
                <MapPin size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-3">
              {t("good_monitor_peak_hours")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">
                  {t("avg_delivery_time")}
                </h3>
                <p className="text-2xl font-semibold mt-1">
                  {summary.avgDeliveryMin} {t("min")}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: "#DC317311" }}
              >
                <Clock size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              {t("imporve_pickup_times_lower")}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500">{t("cancellations")}</h3>
                <p className="text-2xl font-semibold mt-1">
                  {summary.cancellations}
                </p>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: "#DC317311" }}
              >
                <AlertTriangle size={28} color="#DC3173" />
              </div>
            </div>
            <p className="text-xs text-red-600 mt-3">
              {(
                (summary.cancellations / Math.max(1, summary.totalDeliveries)) *
                100
              ).toFixed(1)}
              % {t("of_deliveries")}
            </p>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{t("hourly_load")}</h2>
                <p className="text-sm text-gray-500">
                  {t("delivery_volume_hour_use_balance_driver")}
                </p>
              </div>

              <div className="text-sm text-gray-600">
                {t("heat_view_available")}
              </div>
            </div>

            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hourlyChart}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar
                    dataKey="deliveries"
                    fill="#DC3173"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 flex gap-3 flex-wrap">
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("drivers")}: active
              </div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("zones")}: busy
              </div>
              <div className="text-xs bg-gray-50 px-3 py-1 rounded-full">
                {t("sla")}: 84%
              </div>
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">{t("sla_breakdown")}</h3>
            <div className="h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={slaData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={36}
                    outerRadius={60}
                    paddingAngle={3}
                  >
                    {slaData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[0] }}
                  />
                  <span>{t("on_time")}</span>
                </div>
                <div>{summary.onTimePct}%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[1] }}
                  />
                  <span>{t("late_lg")}</span>
                </div>
                <div>12%</div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[2] }}
                  />
                  <span>{t("cancelled")}</span>
                </div>
                <div>4%</div>
              </div>
            </div>
          </aside>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">{t("top_drivers")}</h3>
            <div className="space-y-3">
              {driverData.map((d) => (
                <div key={d.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                      {d.name.split(" ")[0][0]}
                      {d.name.split(" ")[1][0]}
                    </div>
                    <div>
                      <div className="font-medium">{d.name}</div>
                      <div className="text-xs text-gray-500">
                        {t("avg_pickup")} {d.avgPickupMin} {t("min")}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {d.completed} {t("completed")} • {d.late} {t("late")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">
              {t("actionable_alerts")}
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: "#DC3173" }}
                >
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="font-medium">High late rate in Braga</p>
                  <p className="text-xs text-gray-500">
                    Late deliveries increased by 22% during dinner hours —
                    consider more drivers or surge pay.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: "#DC3173" }}
                >
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="font-medium">Hot zone: central Lisbon</p>
                  <p className="text-xs text-gray-500">
                    Demand concentrated — optimize dispatch and pickup points.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <div
                  className="mt-1 text-white p-2 rounded-lg"
                  style={{ background: "#DC3173" }}
                >
                  <Truck size={16} />
                </div>
                <div>
                  <p className="font-medium">Low driver availability</p>
                  <p className="text-xs text-gray-500">
                    Driver supply down 8% on weekends — run targeted incentives.
                  </p>
                </div>
              </li>
            </ul>

            <div className="mt-4">
              <button
                className="px-4 py-2 rounded-md text-white font-medium shadow"
                style={{ background: "#DC3173" }}
              >
                {t("assign_extra_drivers")}
              </button>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">
            {t("delivery_log_sample")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-500">
                  <th className="pb-3">{t("time")}</th>
                  <th className="pb-3">{t("order")}</th>
                  <th className="pb-3">{t("driver")}</th>
                  <th className="pb-3">{t("zone")}</th>
                  <th className="pb-3">{t("status")}</th>
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

        <footer className="mt-6 text-xs text-gray-400">
          Last updated: Oct 07, 2025 • Data is mocked — connect your delivery
          logs API for real-time insights.
        </footer>
      </div>
    </div>
  );
}
