import Payouts from "@/components/Dashboard/Payouts/Payouts/Payouts";
import { USER_ROLE } from "@/consts/user.const";
import { getAllPayoutsReq } from "@/services/dashboard/payout/payout.service";
import { TDeliveryPartnerPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerPayoutsPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const deliveryPartnerPayoutsResult = await getAllPayoutsReq<
    TDeliveryPartnerPayout[]
  >({
    ...queries,
    userModel: "DeliveryPartner",
  });

  return (
    <Payouts
      payoutsResult={deliveryPartnerPayoutsResult}
      title="delivery_partner_payouts"
      subtitle="manage_all_delivery_partner_payouts_here"
      userRole={USER_ROLE.DELIVERY_PARTNER}
    />
  );
}
