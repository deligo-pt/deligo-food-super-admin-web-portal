"use client";

import AnalyticsChart from "@/components/Dashboard/Performance/AnalyticsChart/AnalyticsChart";
import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import { TDeliveryPartnerAnalyticsData } from "@/types/analytics/delivery-partner-analytics.type";
import { formatPrice } from "@/utils/formatPrice";
import {
  Award,
  BarChart3,
  Clock,
  Euro,
  Map,
  UserCheck,
  Users,
} from "lucide-react";
import {
  Cell,
  Pie,
  PieChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

const PARTNER_COLORS = ["#DC3173", "#8b5cf6", "#f59e0b", "#2563eb"];

interface IProps {
  analyticsData: TDeliveryPartnerAnalyticsData;
}

export default function DeliveryPartnerAnalytics({ analyticsData }: IProps) {
  const {
    summary,
    statusDistribution,
    workloadTrends,
    efficiencyByLevel,
    zonePerformance,
  } = analyticsData;

  return (
    <div className="min-h-screen bg-[#FBFBFE] p-6 space-y-8">
      {/* Header */}
      <TitleHeader
        title="Delivery Partner Analytics"
        subtitle="Analyze partner availability, performance tiers, and regional distribution"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Avg. Daily Active Hours"
          value={`${summary.avgActiveHours}h`}
          icon={Clock}
        />
        <StatsCard
          title="Partner Retention"
          value={`${summary.retentionRate}%`}
          icon={UserCheck}
        />
        <StatsCard
          title="Avg. Partner Earnings"
          value={`€${formatPrice(summary.avgEarningsPerPartner)}`}
          icon={Euro}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Availability Composition */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            Partner Availability
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusDistribution.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PARTNER_COLORS[index % PARTNER_COLORS.length]}
                      stroke="none"
                    />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {statusDistribution.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: PARTNER_COLORS[idx] }}
                  />
                  <span className="text-xs font-medium text-slate-500">
                    {item.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-800">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workload vs Capacity (Dual Line/Bar Chart) */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
            <BarChart3 size={18} className="text-[#DC3173]" />
            Workload vs. Available Partners
          </h3>
          <AnalyticsChart
            data={workloadTrends}
            type="bar" // Using Bar to show partner count
            dataKey="activePartners"
            xKey="time"
            height={280}
          />
        </div>
      </div>

      {/* Performance Tiers & Zones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Efficiency by Experience Tier */}
        <div className="bg-white p-8 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 text-sm mb-6 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Completion Time by Partner Level
          </h3>
          <AnalyticsChart
            data={efficiencyByLevel}
            type="bar"
            dataKey="avgCompletionTime"
            xKey="level"
            height={250}
          />
          <p className="text-[11px] text-slate-400 mt-4 italic text-center">
            * Average time in minutes from order acceptance to delivery
          </p>
        </div>

        {/* Regional Distribution Grid */}
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-sm ml-2 flex items-center gap-2">
            <Map size={18} className="text-indigo-500" />
            Partner Zone Saturation
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {zonePerformance.map((zone, idx) => (
              <div
                key={idx}
                className="bg-slate-100 p-5 rounded-3xl border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between mb-4">
                  <span className="text-xs text-slate-600 uppercase tracking-tighter">
                    {zone.zoneName}
                  </span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <span className="text-xs font-bold">{zone.avgRating}</span>
                    <Award size={12} className="fill-amber-500" />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-slate-800">
                      {zone.partnerCount}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Partners Active
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${zone.demandSaturation > 80 ? "text-rose-500" : "text-emerald-500"}`}
                    >
                      {zone.demandSaturation}%
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Demand
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
