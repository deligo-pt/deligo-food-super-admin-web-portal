import LoyaltyPoints from "@/components/Dashboard/LoyaltyPoints/LoyaltyPoints";
import { getAllLoyaltyPointsReq } from "@/services/dashboard/loyalty-points/loyalty-points.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function LoyaltyPointsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const pointsResult = await getAllLoyaltyPointsReq(queries);

  return <LoyaltyPoints pointsResult={pointsResult} />;
}
