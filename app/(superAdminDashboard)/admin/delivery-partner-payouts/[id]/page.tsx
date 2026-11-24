import PayoutDetails from "@/components/Dashboard/Payouts/PayoutDetails/PayoutDetails";
import { getRiderFleetManagerReq } from "@/services/dashboard/payout/payout-links.service";
import { getSinglePayoutReq } from "@/services/dashboard/payout/payout.service";
import { TPayout } from "@/types/payout.type";

export default async function DeliveryPartnerPayoutDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payout: TPayout = await getSinglePayoutReq(id);
  const fleetManager = await getRiderFleetManagerReq(payout?.userId?.userId);

  return <PayoutDetails payout={payout} fleetManager={fleetManager} />;
}
