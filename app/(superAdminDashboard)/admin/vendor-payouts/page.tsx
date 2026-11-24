import Payouts from "@/components/Dashboard/Payouts/Payouts/Payouts";
import { USER_ROLE } from "@/consts/user.const";
import { withVendorShopNames } from "@/services/dashboard/payout/payout-links.service";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";
import { TPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorPayoutsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorPayoutsResult = await getAllPayoutsReq<TPayout[]>({
    ...queries,
    userModel: "Vendor",
  });
  // The Vendor column shows the shop, not the owner — see withVendorShopNames.
  if (Array.isArray(vendorPayoutsResult.data)) {
    vendorPayoutsResult.data = await withVendorShopNames(vendorPayoutsResult.data);
  }

  return (
    <Payouts
      payoutsResult={vendorPayoutsResult}
      title="vendor_payouts"
      subtitle="manage_all_vendor_payouts_here"
      userRole={USER_ROLE.VENDOR}
    />
  );
}
