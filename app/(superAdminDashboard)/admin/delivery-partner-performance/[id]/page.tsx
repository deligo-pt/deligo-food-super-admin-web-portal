import DeliveryPartnerPerformanceDetails from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformanceDetails";
import { getSinglePerformanceReq } from "@/services/dashboard/analytics/analytics.service";
import { TPartnerPerformanceDetailsData } from "@/types/performance.type";

export default async function DeliveryPartnerPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partnerPerformanceData: TPartnerPerformanceDetailsData =
    await getSinglePerformanceReq<TPartnerPerformanceDetailsData>(
      `delivery-partner-performance-details-analytics/${id}`,
    );

  return (
    <DeliveryPartnerPerformanceDetails
      partnerPerformanceData={partnerPerformanceData}
    />
  );
}
