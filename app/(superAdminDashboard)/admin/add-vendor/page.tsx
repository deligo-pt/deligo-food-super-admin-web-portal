export const dynamic = "force-dynamic";

import AddVendor from "@/components/Dashboard/Vendors/AddVendor/AddVendor";
import { serverRequest } from "@/lib/serverFetch";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";
import { TResponse } from "@/types";
import { TBusinessCategoryResponse } from "@/types/category.type";

export default async function AddVendorPage() {
  let businessCategories: TBusinessCategoryResponse[] = [];
  const result = await getAllCuisine();

  try {
    const result = (await serverRequest.get(
      "/categories/businessCategory",
    )) as unknown as TResponse<TBusinessCategoryResponse[]>;

    if (result?.success) {
      businessCategories = result?.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <AddVendor businessCategories={businessCategories} cuisines={result?.data} />;
}
