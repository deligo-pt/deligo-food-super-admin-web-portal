import DeliveryInsights from "@/components/Dashboard/Analytics/DeliveryInsights/DeliveryInsights";
import { getDeliveryInsightsReq } from "@/services/dashboard/analytics/analytics.service";
import { TDeliveryInsightsData } from "@/types/analytics.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryInsightsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const analyticsData: TDeliveryInsightsData =
    await getDeliveryInsightsReq(queries);

  return <DeliveryInsights analyticsData={analyticsData} />;
}
