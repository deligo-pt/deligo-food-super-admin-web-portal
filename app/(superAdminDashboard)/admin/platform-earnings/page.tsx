import PlatformEarnings from "@/components/Dashboard/Payments/PlatformEarnings/PlatformEarnings";
import { getPlatformEarningsReq } from "@/services/dashboard/analytics/analytics.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function PlatformEarningsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const platformsEarningsData = await getPlatformEarningsReq(queries);

  return <PlatformEarnings platformsEarningsData={platformsEarningsData} />;
}
