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
      title="Suspended Fleet Managers"
      subtitle="All blocked fleet managers from the system"
    />
  );
}
