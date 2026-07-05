import Payouts from "@/components/Dashboard/Payouts/Payouts/Payouts";
import { USER_ROLE } from "@/consts/user.const";
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
    <Payouts
      payoutsResult={fleetManagerPayoutsResult}
      title="fleet_manager_payouts"
      subtitle="manage_all_fleet_manager_payouts_here"
      userRole={USER_ROLE.FLEET_MANAGER}
    />
  );
}
