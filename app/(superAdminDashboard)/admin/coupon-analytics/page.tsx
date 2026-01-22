
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useMemo } from "react";
import { Percent, TicketPercent, BarChart3, Filter, Calendar, RefreshCcw } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";



export default function CouponAnalyticsPage() {
  const { t } = useTranslation();
  const [dateRange, setDateRange] = useState("last30");
  const [typeFilter, setTypeFilter] = useState("all");

  // Mock dataset
  const coupons = [
    { id: "CP10", type: "Percentage", used: 230, issued: 500, vendor: "Burger House" },
    { id: "FD5", type: "Free Delivery", used: 180, issued: 600, vendor: "All Vendors" },
    { id: "HB20", type: "Flat Discount", used: 90, issued: 200, vendor: "Healthy Bites" },
    { id: "PZ15", type: "Percentage", used: 350, issued: 700, vendor: "Pizza Magic" },
  ];

  const filtered = useMemo(() => {
    if (typeFilter === "all") return coupons;
    return coupons.filter((c) => c.type === typeFilter);
  }, [typeFilter]);

  const totalUsed = filtered.reduce((a, b) => a + b.used, 0);
  const totalIssued = filtered.reduce((a, b) => a + b.issued, 0);
  const successRate = totalIssued ? ((totalUsed / totalIssued) * 100).toFixed(1) : 0;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{t("coupon_analytics")}</h1>
          <p className="text-gray-600 text-sm">{t("performance_insights_coupon_campaigns")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between bg-white border rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium">{t("filters")}</span>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border rounded-xl px-3 py-2 text-sm shadow-sm">
            <option value="today">{t("today")}</option>
            <option value="last7">{t("last_7_days")}</option>
            <option value="last30">{t("last_30_days")}</option>
            <option value="ytd">{t("year_to_date")}</option>
          </select>

          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border rounded-xl px-3 py-2 text-sm shadow-sm">
            <option value="all">{t("all_types")}</option>
            <option value="Percentage">{t("percentage")}</option>
            <option value="Flat Discount">{t("flat_discount")}</option>
            <option value="Free Delivery">{t("free_delivery")}</option>
          </select>

          <button className="px-4 py-2 rounded-xl border text-sm flex items-center gap-2">
            <RefreshCcw size={14} /> {t("reset")}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <KpiCard title={t("total_coupons_used")} value={totalUsed} icon={<TicketPercent size={28} />} color="from-[#DC3173] to-pink-500" />

        <KpiCard title={t("total_coupons_issued")} value={totalIssued} icon={<Calendar size={28} />} color="from-blue-500 to-blue-400" />

        <KpiCard title={t("success_rate")} value={`${successRate}%`} icon={<Percent size={28} />} color="from-green-500 to-emerald-400" />
      </div>

      {/* Top Performing Coupons */}
      <div className="mt-10 bg-white border rounded-3xl p-6 shadow">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={20} className="text-[#DC3173]" /> {t("top_performing_coupons")}
        </h2>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600 border-b">
              <tr>
                <th className="p-4 text-left">{t("coupon")}</th>
                <th className="p-4 text-left">{t("type")}</th>
                <th className="p-4 text-left">{t("vendor")}</th>
                <th className="p-4 text-left">{t("used")}</th>
                <th className="p-4 text-left">{t("issued")}</th>
                <th className="p-4 text-left">{t("usage_rate")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4 font-semibold">{c.id}</td>
                  <td className="p-4">{c.type}</td>
                  <td className="p-4">{c.vendor}</td>
                  <td className="p-4 font-semibold">{c.used}</td>
                  <td className="p-4">{c.issued}</td>
                  <td className="p-4 font-semibold text-[#DC3173]">{((c.used / c.issued) * 100).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="p-4 bg-white border rounded-xl shadow-sm">
              <div className="flex justify-between items-center">
                <div className="font-bold text-lg">{c.id}</div>
                <div className="text-sm bg-gray-100 px-3 py-1 rounded-full">{c.type}</div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{t("vendor")}: {c.vendor}</p>
              <p className="mt-2 text-sm">{t("used")}: <span className="font-semibold">{c.used}</span></p>
              <p className="text-sm">{t("issued")}: {c.issued}</p>
              <p className="text-sm mt-1 font-semibold text-[#DC3173]">{t("usage_rate")}: {((c.used / c.issued) * 100).toFixed(1)}%</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// COMPONENT: KPI Card
function KpiCard({ title, value, icon, color }: any) {
  return (
    <div className={`rounded-2xl p-6 text-white shadow bg-linear-to-br ${color} flex items-center gap-4`}>
      <div className="p-3 bg-white/20 rounded-xl">{icon}</div>
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
      </div>
    </div>
  );
}
