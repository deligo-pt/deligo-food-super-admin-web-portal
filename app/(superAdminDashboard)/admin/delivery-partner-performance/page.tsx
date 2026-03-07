import DeliveryPartnerPerformance from "@/components/Dashboard/Performance/DeliveryPartnerPerformance/DeliveryPartnerPerformance";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TPartnerPerformanceData } from "@/types/performance.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerPerformancePage({
  searchParams,
}: IProps) {
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

  let initialData: TPartnerPerformanceData = {} as TPartnerPerformanceData;

  try {
    const result = (await serverRequest.get(
      "/analytics/delivery-partner-performance-analytics",
      {
        params: query,
      },
    )) as TResponse<TPartnerPerformanceData>;

    console.log(result);

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <DeliveryPartnerPerformance partnerPerformanceData={initialData} />;
}
