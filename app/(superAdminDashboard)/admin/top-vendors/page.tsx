import TopVendors from "@/components/Dashboard/Analytics/TopVendors/TopVendors";
import { getTopVendorsReq } from "@/services/dashboard/analytics/analytics.service";
import { TTopVendors } from "@/types/analytics/top-vendors.type";

export default async function TopVendorsPage() {
  const topVendorData: TTopVendors = await getTopVendorsReq();

  return <TopVendors topVendors={topVendorData} />;
}
