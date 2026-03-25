import CategoriesTitle from "@/components/ProductCategories/ProductCategoriesTitle";
import CategoryTable from "@/components/ProductCategories/ProductCategoryTable";
import { getAllProductCategoriesReq } from "@/services/dashboard/category/product-category.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BusinessCategoryPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const categoriesResult = await getAllProductCategoriesReq(queries);

  return (
    <div className="space-y-6 max-w-full p-6">
      {/* Page Title */}
      <CategoriesTitle />

      {/* category Table */}
      <CategoryTable categoriesResult={categoriesResult} />
    </div>
  );
}
