import FleetManagers from "@/components/Dashboard/FleetManagers/FleetManagers";
import { getAllFleetManagersReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BlockedFleetManagersPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const agentsResult = await getAllFleetManagersReq({
    ...queries,
    status: "BLOCKED",
  });

  return (
    <FleetManagers
      agentsResult={agentsResult}
      title="suspended_fleet_managers"
      subtitle="all_blocked_fleet_managers_from_system"
    />
  );
}
