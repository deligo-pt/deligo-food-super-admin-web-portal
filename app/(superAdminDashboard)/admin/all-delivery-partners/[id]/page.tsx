import { DeliveryPartnerDetails } from "@/components/AllDeliveryPartners/DeliveryPartnerDetails/DeliveryPartnerDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";

export default async function DeliveryPartnerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialData: TDeliveryPartner = {} as TDeliveryPartner;

  try {
    const result = (await serverRequest.get(
      `/delivery-partners/${id}`
    )) as unknown as TResponse<TDeliveryPartner>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.error("Server fetchProducts error:", err);
  }
  return (
    <div className="p-4 md:p-6">
      <DeliveryPartnerDetails partner={initialData} />
    </div>
  );
}
