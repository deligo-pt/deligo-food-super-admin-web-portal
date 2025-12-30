import AllVendorsTitle from "@/components/AllVendors/AllVendorsTitle";
import VendorTable from "@/components/AllVendors/VendorTable";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TUserQueryParams, TVendor } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllVendorsPage({ searchParams }: IProps) {
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

  const initialData: { data: TVendor[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/vendors", {
      params: query,
    })) as unknown as TResponse<TVendor[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta as TMeta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full overh">
      {/* Page Title */}
      <AllVendorsTitle />

      {/* Vendor Table */}
      <VendorTable vendorsResult={initialData} />
    </div>
  );
}
