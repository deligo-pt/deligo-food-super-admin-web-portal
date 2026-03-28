import DeliveryPartnerPerformance from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformance";
import { getPerformanceAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TMeta } from "@/types";
import { TPartnerPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerPerformancePage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnerPerformanceData = await getPerformanceAnalyticsReq<{
    data: TPartnerPerformanceData;
    meta?: TMeta;
  }>("delivery-partner-performance-analytics", queries);

  return (
    <DeliveryPartnerPerformance
      partnerPerformanceData={partnerPerformanceData.data}
    />
  );
}
