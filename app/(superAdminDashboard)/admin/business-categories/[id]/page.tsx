import BusinessCategoryDetails from "@/components/AllBusinessCategories/BusinessCategoryDetails";
import { getSingleBusinessCategoryReq } from "@/services/dashboard/category/business-category.service";
import { TBusinessCategory } from "@/types/category.type";

export default async function BusinessCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData: TBusinessCategory = await getSingleBusinessCategoryReq(id);

  return <BusinessCategoryDetails category={initialData} />;
}
