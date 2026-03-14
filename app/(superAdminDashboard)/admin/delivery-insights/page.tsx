import DeliveryInsights from "@/components/Dashboard/Analytics/DeliveryInsights/DeliveryInsights";
import { serverRequest } from "@/lib/serverFetch";
import { TDeliveryInsightsData } from "@/types/analytics.type";
import { catchAsync } from "@/utils/catchAsync";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryInsightsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
  };

  let initialData: TDeliveryInsightsData = {} as TDeliveryInsightsData;

  const result = await catchAsync<TDeliveryInsightsData>(async () => {
    return await serverRequest.get("/analytics/admin/delivery-insights", {
      params: query,
    });
  });

  if (result?.success) {
    initialData = result.data;
  }

  return <DeliveryInsights analyticsData={initialData} />;
}
