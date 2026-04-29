import RejectPayout from "@/components/Dashboard/Payouts/MakePayout/RejectPayout";
import { getSinglePayoutReq } from "@/services/dashboard/payout/payout.service";
import { TPayout } from "@/types/payout.type";

export default async function FleetRejectPayoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payout: TPayout = await getSinglePayoutReq(id);

  return <RejectPayout payout={payout} />;
}
