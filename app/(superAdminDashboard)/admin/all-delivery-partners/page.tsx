import DeliveryPartners from "@/components/Dashboard/DeliveryPartners/DeliveryPartners";
import { getAllDeliveryPartnersReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllDeliveryPartnersPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnersResult = await getAllDeliveryPartnersReq(queries);

  return (
    <DeliveryPartners
      partnersResult={partnersResult}
      showFilters={true}
      title="All Delivery Partners"
      subtitle="Manage all registered delivery partners"
    />
  );
}
