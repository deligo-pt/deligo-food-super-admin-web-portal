import { VendorPerformanceDetails } from "@/components/Dashboard/Performance/VendorPerformance/VendorPerformanceDetails";
import { getSinglePerformanceReq } from "@/services/dashboard/analytics/analytics.service";
import { TVendorPerformanceDetailsData } from "@/types/performance.type";

export default async function VendorPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const performanceData: TVendorPerformanceDetailsData =
    await getSinglePerformanceReq<TVendorPerformanceDetailsData>(
      `vendor-performance-analytics/${id}`,
    );

  return <VendorPerformanceDetails performanceData={performanceData} />;
}
