import { VendorPerformanceDetails } from "@/components/Dashboard/Performance/VendorPerformance/VendorPerformanceDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TVendorPerformanceDetailsData } from "@/types/performance.type";

export default async function VendorPerformanceDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TVendorPerformanceDetailsData =
    {} as TVendorPerformanceDetailsData;

  try {
    const result = (await serverRequest.get(
      `/analytics/admin/vendor-performance-analytics/${id}`,
    )) as TResponse<TVendorPerformanceDetailsData>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <VendorPerformanceDetails performanceData={initialData} />;
}
