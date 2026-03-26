import FleetManagerDetails from "@/components/Dashboard/FleetManagers/FleetManagerDetails/FleetManagerDetails";
import { getSingleFleetManagerReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";

export default async function FleetManagerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const agent = await getSingleFleetManagerReq(id);

  return <FleetManagerDetails agent={agent} />;
}
