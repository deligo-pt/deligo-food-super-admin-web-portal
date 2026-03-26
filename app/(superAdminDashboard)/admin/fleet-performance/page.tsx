import FleetManagerPerformance from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformance";
import { getPerformanceAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TFleetPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetPerformancePage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const fleetPerformanceData =
    await getPerformanceAnalyticsReq<TFleetPerformanceData>(
      "fleet-performance-analytics",
      queries,
    );

  return (
    <FleetManagerPerformance fleetPerformanceData={fleetPerformanceData} />
  );
}
