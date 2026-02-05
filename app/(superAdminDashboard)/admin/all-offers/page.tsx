import ActiveCampaigns from "@/components/Dashboard/Offers/ActiveCampaigns/ActiveCampaigns";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllOffersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const activeStatus = queries.activeStatus;
  const validStatus = queries.validStatus;

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(activeStatus ? { isActive: activeStatus !== "ACTIVE" } : {}),
    ...(validStatus ? { isExpired: validStatus !== "VALID" } : {}),
    isDeleted: false,
  };

  const initialData: { data: TOffer[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/offers", {
      params,
    })) as TResponse<{ data: TOffer[]; meta?: TMeta }>;

    if (result?.success) {
      initialData.data = result.data.data;
      initialData.meta = result.data.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <ActiveCampaigns
      offersResult={initialData}
      showFilters={true}
      title="All Offers"
      subtitle="Manage all offers here"
    />
  );
}
