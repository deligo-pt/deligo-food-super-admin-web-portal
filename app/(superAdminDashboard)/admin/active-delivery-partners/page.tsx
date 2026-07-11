import DeliveryPartners from "@/components/Dashboard/DeliveryPartners/DeliveryPartners";
import { getAllDeliveryPartnersReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ActiveDeliveryPartnersPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnersResult = await getAllDeliveryPartnersReq({
    ...queries,
    status: "APPROVED",
  });

  return (
    <DeliveryPartners
      partnersResult={partnersResult}
      title="active_riders"
      subtitle="all_active_riders_system"
    />
  );
}
