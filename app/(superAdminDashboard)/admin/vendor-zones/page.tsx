import VendorZones from "@/components/Dashboard/Zones/VendorZones/VendorZones";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";
import { TMeta } from "@/types";
import { TZone } from "@/types/zone.type";

export default async function VendorZonesPage() {
  const vendorsResult = await getAllVendorsReq({ limit: "100" });

  const zonesData = vendorsResult?.data?.reduce(
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
