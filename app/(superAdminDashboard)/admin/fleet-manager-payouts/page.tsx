import FleetManagerPayouts from "@/components/Dashboard/Payouts/FleetManagerPayouts/FleetManagerPayouts";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TFleetManagerPayout } from "@/types/payout.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetManagerPayoutsPage({
  searchParams,
}: IProps) {
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
    userModel: "FleetManager",
  };

  const initialData: { data: TFleetManagerPayout[]; meta?: TMeta } = {
    data: [],
  };

  try {
    const result = (await serverRequest.get("/payouts", {
      params: query,
    })) as TResponse<TFleetManagerPayout[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <FleetManagerPayouts
      fleetManagerPayoutsResult={initialData}
      title="Fleet Manager Payouts"
      subtitle=" Manage all fleet manager payouts here"
    />
  );
}
