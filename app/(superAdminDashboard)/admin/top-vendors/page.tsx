import TopVendors from "@/components/Dashboard/Analytics/TopVendors/TopVendors";
import { serverRequest } from "@/lib/serverFetch";
import { TTopVendorData } from "@/types/analytics.type";
import { catchAsync } from "@/utils/catchAsync";

export default async function TopVendorsPage() {
  let initialData: TTopVendorData = {} as TTopVendorData;

  const result = await catchAsync<{ data: TTopVendorData }>(async () => {
    return await serverRequest.get("/analytics/admin/top-vendors");
  });

  if (result?.success) {
    initialData = result.data.data;
  }

  return <TopVendors topVendorData={initialData} />;
}
