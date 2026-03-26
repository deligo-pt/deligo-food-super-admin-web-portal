import VendorPayouts from "@/components/Dashboard/Payouts/VendorPayouts/VendorPayouts";
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
    <VendorPayouts
      vendorPayoutsResult={vendorPayoutsResult}
      title="Vendor Payouts"
      subtitle=" Manage all vendor payouts here"
    />
  );
}
