import { CustomerReport } from "@/components/Dashboard/Reports/CustomerReport/CustomerReport";
import { serverRequest } from "@/lib/serverFetch";
import { getCustomerReportAnalytics } from "@/services/dashboard/reports/reports.service";
import { TMeta, TResponse } from "@/types";
import { TCustomer } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerReportPage({ searchParams }: IProps) {
  const customerReportAnalytics = await getCustomerReportAnalytics();
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

  return <CustomerReport customersData={initialData} customerReportAnalytics={customerReportAnalytics} />;
}
