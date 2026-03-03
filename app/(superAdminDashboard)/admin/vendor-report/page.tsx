import VendorReport from "@/components/Dashboard/Reports/VendorReport/VendorReport";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TVendorReport } from "@/types/report.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorReportPage({ searchParams }: IProps) {
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

  const initialData: { data: TVendorReport; meta?: TMeta } = {
    data: {} as TVendorReport,
  };

  try {
    const result = (await serverRequest.get(
      "/analytics/admin-vendor-report-analytics",
      {
        params: query,
      },
    )) as TResponse<TVendorReport>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <VendorReport reportData={initialData} />;
}
