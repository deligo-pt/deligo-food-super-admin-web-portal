export const dynamic = "force-dynamic";

import UpdateDeliveryPartner from "@/components/Dashboard/DeliveryPartners/UpdateDeliveryPartner/UpdateDeliveryPartner";
import { getSingleDeliveryPartnerReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";

export default async function UpdateDeliveryPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const deliveryPartnerData: TDeliveryPartner =
    await getSingleDeliveryPartnerReq(id);

  return <UpdateDeliveryPartner partner={deliveryPartnerData} />;
}
