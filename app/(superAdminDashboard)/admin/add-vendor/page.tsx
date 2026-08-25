export const dynamic = "force-dynamic";

import AddVendor from "@/components/Dashboard/Vendors/AddVendor/AddVendor";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";

export default async function AddVendorPage() {
  const result = await getAllCuisine();
  const businessCategoriesRes = await getAllBusinessCategoriesReq();


  return <AddVendor businessCategories={businessCategoriesRes?.data} cuisines={result?.data} />;
}
