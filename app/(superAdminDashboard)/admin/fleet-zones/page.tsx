import FleetZones from "@/components/Dashboard/Zones/FleetZones/FleetZones";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TAgent } from "@/types/user.type";
import { TZone } from "@/types/zone.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function FleetZonesPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 100);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
    isDeleted: false,
  };

  const initialData: { data: TAgent[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/fleet-managers", {
      params: query,
    })) as TResponse<TAgent[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  const zonesData = initialData?.data?.reduce(
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
