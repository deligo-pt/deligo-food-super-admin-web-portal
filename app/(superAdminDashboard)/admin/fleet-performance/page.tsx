import FleetManagerPerformance from "@/components/Dashboard/Performance/FleetManagerPerformance/FleetManagerPerformance";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TFleetPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetPerformancePage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
    isDeleted: false,
  };

  const performanceData: { data: TFleetPerformanceData; meta?: TMeta } = {
    data: {} as TFleetPerformanceData,
  };

  try {
    const result = (await serverRequest.get(
      "/analytics/fleet-performance-analytics",
      {
        params: query,
      },
    )) as TResponse<{ data: TFleetPerformanceData; meta: TMeta }>;

    if (result?.success) {
      performanceData.data = result.data?.data;
      performanceData.meta = result.data?.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <FleetManagerPerformance fleetPerformanceData={performanceData} />;
}
