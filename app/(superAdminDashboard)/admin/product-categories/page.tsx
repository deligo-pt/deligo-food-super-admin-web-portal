import CategoriesTitle from "@/components/ProductCategories/ProductCategoriesTitle";
import CategoryTable from "@/components/ProductCategories/ProductCategoryTable";



export default function BusinessCategoryPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <CategoriesTitle />

      {/* category Table */}
      <CategoryTable />
    </div>
  );
}
