import FleetManagers from "@/components/Dashboard/FleetManagers/FleetManagers";
import { getAllFleetManagersReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllFleetManagersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const agentsResult = await getAllFleetManagersReq(queries);

  return (
    <FleetManagers
      agentsResult={agentsResult}
      showFilters={true}
      title="All Fleet Managers"
      subtitle="Manage all registered fleet managers"
    />
  );
}
