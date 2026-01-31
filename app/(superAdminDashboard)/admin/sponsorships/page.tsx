import Sponsorships from "@/components/Dashboard/Sponsorships/Sponsorships";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TSponsorship } from "@/types/sponsorship.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function SponsorshipPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
    isDeleted: false,
  };

  const initialData: { data: TSponsorship[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/sponsorships", {
      params: query,
    })) as TResponse<TSponsorship[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <Sponsorships
      sponsorshipsResult={initialData}
      title="All Sponsorships"
      subtitle=" Manage all sponsorships here"
    />
  );
}
