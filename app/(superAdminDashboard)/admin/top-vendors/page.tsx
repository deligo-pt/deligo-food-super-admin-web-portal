import TopVendors from "@/components/Dashboard/Analytics/TopVendors/TopVendors";
import { getTopVendorsReq } from "@/services/dashboard/analytics/analytics.service";
import { TTopVendorData } from "@/types/analytics.type";

export default async function TopVendorsPage() {
  const topVendorData: TTopVendorData = await getTopVendorsReq();

  return <TopVendors topVendorData={topVendorData} />;
}
