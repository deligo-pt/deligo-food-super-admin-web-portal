import FleetManagerPerformanceDetails from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformanceDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TFleetPerformanceDetailsData } from "@/types/performance.type";

export default async function fleetPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TFleetPerformanceDetailsData =
    {} as TFleetPerformanceDetailsData;

  try {
    const result = (await serverRequest.get(
      `/analytics/admin/fleet-performance-details-analytics/${id}`,
    )) as TResponse<TFleetPerformanceDetailsData>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <FleetManagerPerformanceDetails performanceData={initialData} />;
}
