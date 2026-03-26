import FleetManagerPerformanceDetails from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformanceDetails";
import { getSinglePerformanceReq } from "@/services/dashboard/analytics/analytics.service";
import { TFleetPerformanceDetailsData } from "@/types/performance.type";

export default async function fleetPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const performanceData: TFleetPerformanceDetailsData =
    await getSinglePerformanceReq<TFleetPerformanceDetailsData>(
      `fleet-performance-details-analytics/${id}`,
    );

  return <FleetManagerPerformanceDetails performanceData={performanceData} />;
}
