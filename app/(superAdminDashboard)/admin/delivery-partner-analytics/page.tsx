import DeliveryPartnerAnalytics from "@/components/Dashboard/DeliveryPartners/DeliveryPartnerAnalytics/DeliveryPartnerAnalytics";
import { TDeliveryPartnerAnalyticsData } from "@/types/analytics/delivery-partner-analytics.type";

export default function DeliveryPartnerAnalyticsPage() {
  const analyticsData: TDeliveryPartnerAnalyticsData = {
    summary: {
      avgActiveHours: 6.5,
      retentionRate: 92,
      avgEarningsPerPartner: 48.5,
    },

    statusDistribution: [
      { name: "Active", value: 35 }, // Waiting for orders
      { name: "On Delivery", value: 45 }, // Currently delivering
      { name: "Break", value: 10 }, // On temporary break
      { name: "Offline", value: 10 }, // Signed in but not accepting
    ],

    workloadTrends: [
      { time: "08:00", activePartners: 40, ordersProcessed: 12 },
      { time: "10:00", activePartners: 55, ordersProcessed: 28 },
      { time: "12:00", activePartners: 95, ordersProcessed: 142 }, // Lunch peak
      { time: "14:00", activePartners: 80, ordersProcessed: 65 },
      { time: "16:00", activePartners: 65, ordersProcessed: 45 },
      { time: "18:00", activePartners: 110, ordersProcessed: 185 }, // Dinner peak
      { time: "20:00", activePartners: 85, ordersProcessed: 95 },
    ],

    efficiencyByLevel: [
      { level: "Junior", avgCompletionTime: 34 }, // Newer partners take longer
      { level: "Pro", avgCompletionTime: 26 }, // Experienced partners
      { level: "Elite", avgCompletionTime: 19 }, // Top-tier efficiency
    ],

    zonePerformance: [
      {
        zoneName: "Central Business District",
        partnerCount: 42,
        avgRating: 4.8,
        demandSaturation: 94, // High demand, nearly maxed out
      },
      {
        zoneName: "West University Side",
        partnerCount: 28,
        avgRating: 4.6,
        demandSaturation: 65, // Moderate demand
      },
      {
        zoneName: "North Residential",
        partnerCount: 15,
        avgRating: 4.9,
        demandSaturation: 30, // Low demand
      },
      {
        zoneName: "South Industrial Park",
        partnerCount: 12,
        avgRating: 4.2,
        demandSaturation: 82, // High demand, low partner count
      },
    ],
  };
  return <DeliveryPartnerAnalytics analyticsData={analyticsData} />;
}
