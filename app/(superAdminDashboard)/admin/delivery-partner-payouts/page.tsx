import DeliveryPartnerPayouts from "@/components/Dashboard/Payouts/DeliveryPartnerPayouts/DeliveryPartnerPayouts";
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
    <DeliveryPartnerPayouts
      deliveryPartnerPayoutsResult={deliveryPartnerPayoutsResult}
      title="Delivery Partner Payouts"
      subtitle=" Manage all delivery partner payouts here"
    />
  );
}
