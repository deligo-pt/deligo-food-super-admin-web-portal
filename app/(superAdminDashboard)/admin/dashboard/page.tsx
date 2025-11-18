import Dashboard from "@/components/Dashboard/Dashboard";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAnalytics } from "@/types/analytics.type";

export default async function DashboardPage() {
  let analyticsData: TAnalytics = {} as TAnalytics;

  try {
    const result = (await serverRequest.get(
      "/analytics/overview"
    )) as unknown as TResponse<TAnalytics>;

    if (result?.success) {
      analyticsData = result?.data;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <Dashboard analyticsData={analyticsData} />;
}
