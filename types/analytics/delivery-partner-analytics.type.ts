export type TPartnerStatusDistribution = {
  name: "Active" | "On Delivery" | "Break" | "Offline";
  value: number;
};

export type TWorkloadTrend = {
  time: string;
  activePartners: number;
  ordersProcessed: number;
};

export type TPartnerEfficiencyByLevel = {
  level: "Junior" | "Pro" | "Elite";
  avgCompletionTime: number;
};

export type TPartnerZonePerformance = {
  zoneName: string;
  partnerCount: number;
  avgRating: number;
  demandSaturation: number;
};

export type TDeliveryPartnerAnalyticsData = {
  summary: {
    avgActiveHours: number;
    retentionRate: number;
    avgEarningsPerPartner: number;
  };
  statusDistribution: TPartnerStatusDistribution[];
  workloadTrends: TWorkloadTrend[];
  efficiencyByLevel: TPartnerEfficiencyByLevel[];
  zonePerformance: TPartnerZonePerformance[];
};
