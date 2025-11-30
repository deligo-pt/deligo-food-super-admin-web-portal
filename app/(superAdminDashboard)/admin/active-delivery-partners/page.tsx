import ActiveDeliveryPartners from "@/components/ActivePartners/ActivePartners";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TDeliveryPartner } from "@/types/delivery-partner.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ActiveDeliveryPartnersPage({
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
    status: "SUBMITTED",
  };

  const initialData: { data: TDeliveryPartner[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/delivery-partners", {
      params: query,
    })) as unknown as TResponse<TDeliveryPartner[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <ActiveDeliveryPartners partnersResult={initialData} />;
}
