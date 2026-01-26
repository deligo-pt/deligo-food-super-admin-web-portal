import Admins from "@/components/Dashboard/Admins/Admins";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TAdmin } from "@/types/admin.type";
import { TUserQueryParams } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllAdminsPage({ searchParams }: IProps) {
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

  const initialData: { data: TAdmin[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/admins", {
      params: query,
    })) as TResponse<TAdmin[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <Admins
      adminsResult={initialData}
      showFilters={true}
      title="All Admins"
      subtitle="Manage all the existing admins"
    />
  );
}
