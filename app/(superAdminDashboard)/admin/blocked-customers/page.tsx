import Customers from "@/components/Dashboard/Customers/Customers";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TCustomer } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BlockedCustomersPage({ searchParams }: IProps) {
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

  const initialData: { data: TCustomer[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/customers", {
      params: query,
    })) as TResponse<TCustomer[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <Customers
      customersResult={initialData}
      title="Active Customers"
      subtitle="All active customers in the system"
    />
  );
}
