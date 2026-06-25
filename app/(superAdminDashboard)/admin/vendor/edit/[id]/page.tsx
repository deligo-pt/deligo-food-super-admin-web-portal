export const dynamic = "force-dynamic";

import UpdateVendor from "@/components/Dashboard/Vendors/UpdateVendor/UpdateVendor";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";

interface PageProps {params: Promise<{ id: string;}>;
  searchParams?: Promise< Record<string, string | undefined>>;
}

export default async function UpdateVendorPage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, queries] = await Promise.all([
    params,
    searchParams,
  ]);

  const resolvedQueries = queries ?? {};

  const [ vendor, businessCategoriesResponse,cuisinesResponse ] = await Promise.all([
    getSingleVendorReq(id),
    getAllBusinessCategoriesReq(resolvedQueries),
    getAllCuisine(),
  ]);

  return (
    <UpdateVendor
      vendor={vendor as TVendor}
      businessCategories={
        businessCategoriesResponse.data
      }
      cuisines={cuisinesResponse?.data ?? []}
    />
  );
}