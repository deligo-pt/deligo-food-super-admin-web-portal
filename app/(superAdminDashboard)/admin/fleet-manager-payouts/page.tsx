import FleetManagerPayouts from "@/components/Dashboard/Payouts/FleetManagerPayouts/FleetManagerPayouts";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";
import { TFleetManagerPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetManagerPayoutsPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const fleetManagerPayoutsResult = await getAllPayoutsReq<
    TFleetManagerPayout[]
  >({
    ...queries,
    userModel: "FleetManager",
  });

  return (
    <FleetManagerPayouts
      fleetManagerPayoutsResult={fleetManagerPayoutsResult}
      title="Fleet Manager Payouts"
      subtitle=" Manage all fleet manager payouts here"
    />
  );
}
