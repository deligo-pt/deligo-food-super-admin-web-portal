import { DeliveryPartnerDetails } from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/DeliveryPartnerDetails";
import { getSingleDeliveryPartnerReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { TDeliveryPartner } from "@/types/delivery-partner.type";

export default async function DeliveryPartnerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const partner: TDeliveryPartner = await getSingleDeliveryPartnerReq(id);

  return (
    <div>
      <DeliveryPartnerDetails partner={partner} />
    </div>
  );
}
