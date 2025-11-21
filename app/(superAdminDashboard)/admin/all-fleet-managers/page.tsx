import AgentTable from "@/components/AllAgents/AgentTable";
import AllAgentsTitle from "@/components/AllAgents/AllAgentsTitle";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TAgent, TUserQueryParams } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllAgentsPage({ searchParams }: IProps) {
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

  const initialData: { data: TAgent[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/fleet-managers", {
      params: query,
    })) as unknown as TResponse<TAgent[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta as TMeta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <AllAgentsTitle />

      {/* Agents Table */}
      <AgentTable agentsResult={initialData} />
    </div>
  );
}
