import CustomerInsights from "@/components/Dashboard/Analytics/CustomerInsights/CustomerInsights";
import { getCustomerInsightsReq } from "@/services/dashboard/analytics/analytics.service";
import { TCustomerInsights } from "@/types/analytics/customer-insights.type";

export default async function CustomerInsightsPage() {
  const insights: TCustomerInsights = await getCustomerInsightsReq();

  return <CustomerInsights customerInsights={insights} />;
}
