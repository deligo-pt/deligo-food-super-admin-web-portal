import AllCustomers from "@/components/AllCustomers/AllCustomers";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TCustomer, TUserQueryParams } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllCustomersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const query: Partial<TUserQueryParams> = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
  };

  const initialData: { data: TCustomer[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/customers", {
      params: query,
    })) as unknown as TResponse<TCustomer[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta as TMeta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <AllCustomers customersResult={initialData} />;
}
