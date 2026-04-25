export const dynamic = "force-dynamic";

import UpdateVendor from "@/components/Dashboard/Vendors/UpdateVendor/UpdateVendor";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";

export default async function UpdateVendorPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const queries = (await searchParams) || {};

  const vendorData: TVendor = await getSingleVendorReq(id);
  const businessCategoriesData = await getAllBusinessCategoriesReq(queries);

  return (
    <UpdateVendor
      vendor={vendorData}
      businessCategories={businessCategoriesData.data}
    />
  );
}
