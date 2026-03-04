import DeliveryPartnerPayouts from "@/components/Dashboard/Payouts/DeliveryPartnerPayouts/DeliveryPartnerPayouts";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TDeliveryPartnerPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerPayoutsPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    userModel: "DeliveryPartner",
  };

  const initialData: { data: TDeliveryPartnerPayout[]; meta?: TMeta } = {
    data: [],
  };

  try {
    const result = (await serverRequest.get("/payouts", {
      params: query,
    })) as TResponse<TDeliveryPartnerPayout[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <DeliveryPartnerPayouts
      deliveryPartnerPayoutsResult={initialData}
      title="Delivery Partner Payouts"
      subtitle=" Manage all delivery partner payouts here"
    />
  );
}
