export const dynamic = "force-dynamic";

import Dashboard from "@/components/Dashboard/Dashboard";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TAnalytics } from "@/types/analytics.type";

export default async function DashboardPage() {
  let analyticsData: TAnalytics = {} as TAnalytics;

  try {
    const result = (await serverRequest.get(
      "/analytics/admin-dashboard-analytics"
    )) as unknown as TResponse<TAnalytics>;

    if (result?.success) {
      analyticsData = result?.data;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Server fetch error:", err?.response?.data || err);
  }

  return <Dashboard analyticsData={analyticsData} />;
}
