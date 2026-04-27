"use client";

import StatsCard from "@/components/Dashboard/Performance/StatsCard/StatsCard";
import TitleHeader from "@/components/TitleHeader/TitleHeader";
import CustomizedCharts from "@/components/common/CustomizedChart/CustomizedChart";
import { TOfferAnalytics } from "@/types/offer.type";
import { formatPrice } from "@/utils/formatPrice";
import { removeUnderscore } from "@/utils/formatter";
import { Clock, Tag, TrendingUp, Users } from "lucide-react";

interface IProps {
  analyticsData: TOfferAnalytics;
}

export default function OfferAnalytics({ analyticsData }: IProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <TitleHeader
        title="Offer Analytics"
        subtitle="Track offer performance and usage"
      />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Offers"
          value={analyticsData.stats.totalOffers}
          icon={Tag}
          delay={0}
        />
        <StatsCard
          title="Active Offers"
          value={analyticsData.stats.activeOffers}
          icon={Clock}
          delay={0.1}
        />
        <StatsCard
          title="Total Redemptions"
          value={analyticsData.stats.totalRedemptions}
          icon={Users}
          delay={0.2}
        />
        <StatsCard
          title="Revenue Impact"
          value={`€${formatPrice(analyticsData.stats.revenueImpact)}`}
          icon={TrendingUp}
          delay={0.3}
        />
      </div>

      <CustomizedCharts
        type="area"
        title="Redemptions Trend"
        description="The number of usages over time"
        data={analyticsData.usageOverTime || []}
        xLabel="Time"
        yLabel="User Redemptions"
        xKey="time"
        yKey="redemptions"
        delay={0.4}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CustomizedCharts
          type="pie"
          title="Offer Type Distribution"
          data={analyticsData.offerTypeUsage || []}
          yKey="usage"
          delay={0.5}
        />
        <CustomizedCharts
          title="Top Performing Offers"
          data={analyticsData.topOffers || []}
          xLabel="Offer Name"
          yLabel="Usage Count"
          xKey="name"
          yKey="usage"
          delay={0.6}
          xLabelCustomizedValue={(val) => removeUnderscore(val as string)}
        />
      </div>
    </div>
  );
}
