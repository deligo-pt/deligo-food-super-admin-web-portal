import DeliveryPartners from "@/components/Dashboard/DeliveryPartners/DeliveryPartners";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SuspendedDeliveryPartnersPage({
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
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    status: "BLOCKED",
    isDeleted: false,
  };

  const initialData: { data: TDeliveryPartner[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/delivery-partners", {
      params: query,
    })) as TResponse<TDeliveryPartner[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <DeliveryPartners
      partnersResult={initialData}
      title="Suspended Delivery Partners"
      subtitle="All blocked delivery partners from the platform"
    />
  );
}
