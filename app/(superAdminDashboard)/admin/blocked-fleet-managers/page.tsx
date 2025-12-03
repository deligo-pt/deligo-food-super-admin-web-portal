import BlockedFleetManagers from "@/components/BlockedAgents/BlockedAgents";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TAgent } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BlockedFleetManagersPage({
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
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    status: "BLOCKED",
    isDeleted: false,
  };

  const initialData: { data: TAgent[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/fleet-managers", {
      params: query,
    })) as unknown as TResponse<TAgent[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <BlockedFleetManagers agentsResult={initialData} />;
}
