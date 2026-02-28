import VendorZones from "@/components/Dashboard/Zones/VendorZones/VendorZones";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TVendor } from "@/types/user.type";
import { TZone } from "@/types/zone.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorZonesPage({ searchParams }: IProps) {
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

  const initialData: { data: TVendor[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/vendors", {
      params: query,
    })) as TResponse<TVendor[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  const zonesData = initialData?.data?.reduce(
    (acc, vendor) => {
      const city = vendor.businessLocation?.city?.trim() as string;
      const vendorIndex = acc.data.findIndex((z) => z.zoneName === city);

      if (city && vendorIndex === -1) {
        acc.data.push({
          _id: vendor._id,
          zoneName: city,
          isOperational: true,
          zoneId: city.replace(" ", "-").toLowerCase(),
          totalUsers: 1,
          createdAt: vendor.createdAt,
          updatedAt: vendor.updatedAt,
        });
      } else if (city) {
        acc.data[vendorIndex].totalUsers++;
      }

      return acc;
    },
    { data: [] as TZone[] } as { data: TZone[]; meta: TMeta },
  );

  return <VendorZones zonesData={zonesData} />;
}
