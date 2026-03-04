import VendorPayouts from "@/components/Dashboard/Payouts/VendorPayouts/VendorPayouts";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TVendorPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorPayoutsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    userModel: "Vendor",
  };

  const initialData: { data: TVendorPayout[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/payouts", {
      params: query,
    })) as TResponse<TVendorPayout[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <VendorPayouts
      vendorPayoutsResult={initialData}
      title="Vendor Payouts"
      subtitle=" Manage all vendor payouts here"
    />
  );
}
