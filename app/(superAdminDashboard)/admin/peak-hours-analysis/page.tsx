import PeakHourAnalysis from "@/components/Dashboard/Analytics/PeakHourAnalysis/PeakHourAnalysis";
import { serverRequest } from "@/lib/serverFetch";
import { TPeakHourData } from "@/types/analytics.type";
import { catchAsync } from "@/utils/catchAsync";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function PeakHourAnalysisPage({ searchParams }: IProps) {
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

  let initialData: TPeakHourData = {} as TPeakHourData;

  const result = await catchAsync<TPeakHourData>(async () => {
    return await serverRequest.get("/analytics/admin/peak-hours", {
      params: query,
    });
  });

  if (result?.success) {
    initialData = result.data;
  }

  return <PeakHourAnalysis analyticsData={initialData} />;
}
