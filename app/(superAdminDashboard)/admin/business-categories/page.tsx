import CategoriesTitle from "@/components/AllBusinessCategories/BusinessCategoriesTitle";
import CategoryTable from "@/components/AllBusinessCategories/BusinessCategoryTable";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BusinessCategoryPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const categoriesResult = await getAllBusinessCategoriesReq(queries);

  return (
    <div className="space-y-6 max-w-full">
      {/* Page Title */}
      <CategoriesTitle />

      {/* category Table */}
      <CategoryTable categoriesResult={categoriesResult} />
    </div>
  );
}
