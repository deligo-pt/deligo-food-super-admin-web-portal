import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TVendor } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllVendorsPage({ searchParams }: IProps) {
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

  const initialData: { data: TVendor[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/vendors", {
      params: query,
    })) as TResponse<TVendor[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return (
    <Vendors
      vendorsResult={initialData}
      title="Suspended Vendors"
      subtitle="All blocked vendors from the system"
    />
  );
}
