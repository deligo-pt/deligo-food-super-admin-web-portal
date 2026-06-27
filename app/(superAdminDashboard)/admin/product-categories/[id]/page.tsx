import ProductCategoryDetails from "@/components/ProductCategories/ProductCategoryDetails";
import { getSingleProductCategoryReq } from "@/services/dashboard/category/product-category.service";

export default async function ProductCategoryDetailsPage({
  params,
}: {
  params: Promise<Record<string, string | undefined>>;
}) {
  const { id, lang } = await params;
  const category = await getSingleProductCategoryReq(id as string, lang as "en" | "pt");

  return (
    <div>
      <ProductCategoryDetails category={category} />
    </div>
  );
}
