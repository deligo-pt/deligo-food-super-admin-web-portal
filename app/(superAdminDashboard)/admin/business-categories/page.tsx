import CategoriesTitle from "@/components/AllBusinessCategories/BusinessCategoriesTitle";
import CategoryTable from "@/components/AllBusinessCategories/BusinessCategoryTable";

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
