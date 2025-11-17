import BusinessCategoryDetails from "@/components/AllBusinessCategories/BusinessCategoryDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";

export default async function BusinessCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialData: TBusinessCategory = {} as TBusinessCategory;

  try {
    const result = (await serverRequest.get(
      `/categories/businessCategory/${id}`,
      {}
    )) as unknown as TResponse<TBusinessCategory>;

    if (result?.success) {
      initialData = result?.data || {};
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <BusinessCategoryDetails category={initialData} />;
}
