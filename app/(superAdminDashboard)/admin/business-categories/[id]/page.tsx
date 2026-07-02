import BusinessCategoryDetails from "@/components/AllBusinessCategories/BusinessCategoryDetails";
import { getSingleBusinessCategoryReq } from "@/services/dashboard/category/business-category.service";
import { TBusinessCategoryResponse } from "@/types/category.type";

export default async function BusinessCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData: TBusinessCategoryResponse = await getSingleBusinessCategoryReq(id);

  return <BusinessCategoryDetails category={initialData} />;
}
