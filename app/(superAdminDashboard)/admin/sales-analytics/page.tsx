import SalesAnalytics from "@/components/Dashboard/Analytics/SalesAnalytics/SalesAnalytics";
import { serverRequest } from "@/lib/serverFetch";
import { TSalesAnalytics } from "@/types/analytics.type";

export default async function SalesAnalyticsPage() {
  let data: TSalesAnalytics = {} as TSalesAnalytics;

  try {
    const result = await serverRequest.get("/analytics/vendor-sales-analytics");

    if (result?.success) {
      data = result?.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <SalesAnalytics salesAnalytics={data} />;
}
