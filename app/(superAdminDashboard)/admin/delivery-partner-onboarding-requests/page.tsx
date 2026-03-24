import DeliveryPartners from "@/components/Dashboard/DeliveryPartners/DeliveryPartners";
import { getAllDeliveryPartnersReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SubmittedDeliveryPartnersPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const partnersResult = await getAllDeliveryPartnersReq({
    ...queries,
    status: "SUBMITTED",
  });

  return (
    <DeliveryPartners
      partnersResult={partnersResult}
      title="Delivery Partner Onboarding Requests"
      subtitle="All Requested Delivery Partners for Onboarding"
    />
  );
}
