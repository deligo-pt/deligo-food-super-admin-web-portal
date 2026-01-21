import AllTaxes from "@/components/Tax/AllTaxes/AllTaxes";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TTax } from "@/types/tax.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllTaxesPage({ searchParams }: IProps) {
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
    isDeleted: false,
  };

  const initialData: { data: TTax[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/taxes", {
      params: query,
    })) as TResponse<{ data: TTax[]; meta?: TMeta }>;

    if (result?.success) {
      initialData.data = result.data.data;
      initialData.meta = result.data.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <AllTaxes taxesResult={initialData} />;
}
