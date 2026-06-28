import ProductCategoryDetails from "@/components/ProductCategories/ProductCategoryDetails";
import { getSingleProductCategoryReq } from "@/services/dashboard/category/product-category.service";

interface IProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function ProductCategoryDetailsPage({ params, searchParams }: IProps) {
  const { id } = await params;
  const { lang } = await searchParams;

  const category = await getSingleProductCategoryReq(id as string, lang as "en" | "pt");

  return (
    <div>
      <ProductCategoryDetails category={category} />
    </div>
  );
}
