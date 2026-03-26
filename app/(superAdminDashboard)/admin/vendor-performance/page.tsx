import { VendorPerformance } from "@/components/Dashboard/Performance/VendorPerformance/VendorPerformance";
import { getPerformanceAnalyticsReq } from "@/services/dashboard/analytics/analytics.service";
import { TVendorPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorPerformancePage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorPerformanceData =
    await getPerformanceAnalyticsReq<TVendorPerformanceData>(
      "fvendor-performance-analytics",
      queries,
    );

  return <VendorPerformance vendorPerformanceData={vendorPerformanceData} />;
}
