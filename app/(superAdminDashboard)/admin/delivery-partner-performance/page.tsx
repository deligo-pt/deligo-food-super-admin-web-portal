import DeliveryPartnerPerformance from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformance";
import { getPerformanceAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TPartnerPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerPerformancePage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnerPerformanceData =
    await getPerformanceAnalyticsReq<TPartnerPerformanceData>(
      "delivery-partner-performance-analytics",
      queries,
    );

  return (
    <DeliveryPartnerPerformance
      partnerPerformanceData={partnerPerformanceData}
    />
  );
}
