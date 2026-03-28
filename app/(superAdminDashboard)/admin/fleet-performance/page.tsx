import FleetManagerPerformance from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformance";
import { getPerformanceAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TMeta } from "@/types";
import { TFleetPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetPerformancePage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const fleetPerformanceData = await getPerformanceAnalyticsReq<{
    data: TFleetPerformanceData;
    meta?: TMeta;
  }>("fleet-performance-analytics", queries);

  return (
    <FleetManagerPerformance fleetPerformanceData={fleetPerformanceData.data} />
  );
}
