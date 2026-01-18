import CategoriesTitle from "@/components/ProductCategories/ProductCategoriesTitle";
import CategoryTable from "@/components/ProductCategories/ProductCategoryTable";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TProductCategory } from "@/types/category.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BusinessCategoryPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
  };

  const initialData: {
    data: TProductCategory[];
    meta?: TMeta;
    isLoading: boolean;
  } = { data: [], isLoading: true };

  try {
    const result = (await serverRequest.get("/categories/businessCategory", {
      params: query,
    })) as TResponse<TProductCategory[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
      initialData.isLoading = false;
    }
  } catch (err) {
    initialData.isLoading = false;
    console.error("Server fetch error:", err);
  }

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-full">
      {/* Page Title */}
      <CategoriesTitle />

      {/* category Table */}
      <CategoryTable categoriesResult={initialData} />
    </div>
  );
}
