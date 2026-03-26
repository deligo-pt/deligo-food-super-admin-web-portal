export const dynamic = "force-dynamic";

import Dashboard from "@/components/Dashboard/Dashboard/Dashboard";
import { getAdminDashboardReq } from "@/services/dashboard/analytics/analytics.service";
import { TAnalytics } from "@/types/analytics.type";

export default async function DashboardPage() {
  const analyticsData: TAnalytics = await getAdminDashboardReq();

  return <Dashboard analyticsData={analyticsData} />;
}
