export const dynamic = "force-dynamic";

import AddProductCategory from "@/components/ProductCategories/AddProductCategory";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";

export default async function page() {
  const businessCategoriesResult = await getAllBusinessCategoriesReq({});

  return (
    <div>
      <AddProductCategory businessCategories={businessCategoriesResult?.data} />
    </div>
  );
}
