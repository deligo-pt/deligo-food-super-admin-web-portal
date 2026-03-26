import PayoutSettlement from "@/components/Dashboard/Payouts/MakePayout/PayoutSettlement";
import { getSinglePayoutReq } from "@/services/dashboard/payout/payout.service";
import { TPayout } from "@/types/payout.type";

export default async function VendorPayoutSettlementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const payout: TPayout = await getSinglePayoutReq(id);

  return <PayoutSettlement payout={payout} />;
}
