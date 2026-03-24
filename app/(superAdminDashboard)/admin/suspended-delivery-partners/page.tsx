import DeliveryPartners from "@/components/Dashboard/DeliveryPartners/DeliveryPartners";
import { getAllDeliveryPartnersReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SuspendedDeliveryPartnersPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnersResult = await getAllDeliveryPartnersReq({
    ...queries,
    status: "BLOCKED",
  });

  return (
    <DeliveryPartners
      partnersResult={partnersResult}
      title="Suspended Delivery Partners"
      subtitle="All blocked delivery partners from the platform"
    />
  );
}
