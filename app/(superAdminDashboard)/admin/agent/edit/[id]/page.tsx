export const dynamic = "force-dynamic";

import UpdateFleetManager from "@/components/Dashboard/FleetManagers/UpdateFleetManager/UpdateFleetManager";
import { getSingleFleetManagerReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";
import { TAgent } from "@/types/user.type";

export default async function UpdateFleetManagerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fleetManagerData: TAgent = await getSingleFleetManagerReq(id);

  return <UpdateFleetManager fleetManager={fleetManagerData} />;
}
