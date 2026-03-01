import PayoutDetails from "@/components/Dashboard/Payouts/PayoutDetails/PayoutDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TPayout } from "@/types/payout.type";

export default async function DeliveryPartnerPayoutDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TPayout = {} as TPayout;

  try {
    const result = (await serverRequest.get(
      `/payouts/${id}`,
    )) as TResponse<TPayout>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <PayoutDetails payout={initialData} />;
}
