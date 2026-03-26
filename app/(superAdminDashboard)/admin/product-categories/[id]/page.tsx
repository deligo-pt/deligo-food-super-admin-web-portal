import ProductCategoryDetails from "@/components/ProductCategories/ProductCategoryDetails";
import { getSingleProductCategoryReq } from "@/services/dashboard/category/product-category.service";

export default async function ProductCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getSingleProductCategoryReq(id);

  return (
    <div>
      <ProductCategoryDetails category={category} />
    </div>
  );
}
