import SalesAnalytics from "@/components/Dashboard/Analytics/SalesAnalytics/SalesAnalytics";
import { getSalesAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TSalesAnalytics } from "@/types/analytics/sales-analytics.type";

export default async function SalesAnalyticsPage() {
  const data: TSalesAnalytics = await getSalesAnalyticsReq();

  return <SalesAnalytics salesAnalytics={data} />;
}
