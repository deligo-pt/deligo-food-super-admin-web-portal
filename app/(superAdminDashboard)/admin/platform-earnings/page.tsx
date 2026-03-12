import PlatformEarnings from "@/components/Dashboard/Payments/PlatformEarnings/PlatformEarnings";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TPlaformEarningsData } from "@/types/payment.type";
import { catchAsync } from "@/utils/catchAsync";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function PlatformEarningsPage({ searchParams }: IProps) {
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

  const initialData: { data: TPlaformEarningsData; meta?: TMeta } = {
    data: {} as TPlaformEarningsData,
  };

  const result = await catchAsync<{ data: TPlaformEarningsData; meta?: TMeta }>(
    async () => {
      return await serverRequest.get("/analytics/admin/platform-earnings", {
        params: query,
      });
    },
  );

  if (result?.success) {
    initialData.data = result.data.data;
    initialData.meta = result.data.meta;
  }

  return <PlatformEarnings platformsEarningsData={initialData} />;
}
