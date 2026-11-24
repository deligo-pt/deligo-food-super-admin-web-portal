import PayoutDetails from "@/components/Dashboard/Payouts/PayoutDetails/PayoutDetails";
import { withVendorShopNames } from "@/services/dashboard/payout/payout-links.service";
import { getSinglePayoutReq } from "@/services/dashboard/payout/payout.service";
import { TPayout } from "@/types/payout.type";

export default async function VendorPayoutDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found: TPayout = await getSinglePayoutReq(id);
  // The Vendor card shows the shop, not the owner — see withVendorShopNames.
  const [payout] = found?.payoutId ? await withVendorShopNames([found]) : [found];

  return <PayoutDetails payout={payout} />;
}
