import Payouts from "@/components/Dashboard/Payouts/Payouts/Payouts";
import { USER_ROLE } from "@/consts/user.const";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorPayoutsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorPayoutsResult = await getAllPayoutsReq({
    ...queries,
    userModel: "Vendor",
  });

  return (
    <Payouts
      payoutsResult={vendorPayoutsResult}
      title="Vendor Payouts"
      subtitle=" Manage all vendor payouts here"
      userRole={USER_ROLE.VENDOR}
    />
  );
}
