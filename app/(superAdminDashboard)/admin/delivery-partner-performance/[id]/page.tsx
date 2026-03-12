import DeliveryPartnerPerformanceDetails from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformanceDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TPartnerPerformanceDetailsData } from "@/types/performance.type";

export default async function DeliveryPartnerPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TPartnerPerformanceDetailsData =
    {} as TPartnerPerformanceDetailsData;

  try {
    const result = (await serverRequest.get(
      `/analytics/admin/delivery-partner-performance-details-analytics/${id}`,
    )) as TResponse<TPartnerPerformanceDetailsData>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <DeliveryPartnerPerformanceDetails partnerPerformanceData={initialData} />
  );
}
