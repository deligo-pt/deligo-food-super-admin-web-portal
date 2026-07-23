import DeliveryPartnerAnalytics from "@/components/Dashboard/DeliveryPartners/DeliveryPartnerAnalytics/DeliveryPartnerAnalytics";
import { getDeliveryPartnerAnalytics } from "@/services/dashboard/analytics/analytics.service";

export default async function DeliveryPartnerAnalyticsPage() {
  const { data } = await getDeliveryPartnerAnalytics();

  return <DeliveryPartnerAnalytics analyticsData={data} />;
}
