import CustomerInsights from "@/components/Dashboard/Analytics/CustomerInsights/CustomerInsights";
import { serverRequest } from "@/lib/serverFetch";
import { TCustomerInsights } from "@/types/analytics.type";

export default async function CustomerInsightsPage() {
  let data: TCustomerInsights = {} as TCustomerInsights;

  try {
    const result = await serverRequest.get("/analytics/customer-insights");

    if (result?.success) {
      data = result?.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <CustomerInsights insights={data} />;
}
