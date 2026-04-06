import DeliveryInsights from "@/components/Dashboard/Analytics/DeliveryInsights/DeliveryInsights";
import { getDeliveryInsightsReq } from "@/services/dashboard/analytics/analytics.service";
import { TDeliveryInsights } from "@/types/analytics/delivery-insights.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryInsightsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const analyticsData: TDeliveryInsights =
    await getDeliveryInsightsReq(queries);

  return <DeliveryInsights deliveryInsights={analyticsData} />;
}
