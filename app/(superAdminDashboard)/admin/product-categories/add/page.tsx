export const dynamic = "force-dynamic";

import AddProductCategory from "@/components/ProductCategories/AddProductCategory";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";

export default async function page() {
  let initialData: TBusinessCategory[] = {} as TBusinessCategory[];

  try {
    const result = (await serverRequest.get(
      "/categories/businessCategory",
      {}
    )) as unknown as TResponse<{ data: TBusinessCategory[] }>;

    if (result?.success) {
      initialData = result?.data?.data || [];
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return (
    <div className="p-4 md:p-6">
      <AddProductCategory businessCategories={initialData} />
    </div>
  );
}
