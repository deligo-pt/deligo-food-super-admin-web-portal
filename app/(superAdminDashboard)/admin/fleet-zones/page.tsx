import FleetZones from "@/components/Dashboard/Zones/FleetZones/FleetZones";
import { getAllFleetManagersReq } from "@/services/dashboard/fleet-manager/fleet-manager.service";
import { TMeta } from "@/types";
import { TZone } from "@/types/zone.type";

export default async function FleetZonesPage() {
  const fleetManagersResult = await getAllFleetManagersReq({ limit: "100" });

  const zonesData = fleetManagersResult?.data?.reduce(
    (acc, fleet) => {
      const city = fleet.businessLocation?.city?.trim() as string;
      const fleetIndex = acc.data.findIndex((z) => z.zoneName === city);

      if (city && fleetIndex === -1) {
        acc.data.push({
          _id: fleet._id,
          zoneName: city,
          isOperational: true,
          zoneId: city.replace(" ", "-").toLowerCase(),
          totalUsers: 1,
          createdAt: fleet.createdAt,
          updatedAt: fleet.updatedAt,
        });
      } else if (city) {
        acc.data[fleetIndex].totalUsers++;
      }

      return acc;
    },
    { data: [] as TZone[] } as { data: TZone[]; meta: TMeta },
  );

  return <FleetZones zonesData={zonesData} />;
}
