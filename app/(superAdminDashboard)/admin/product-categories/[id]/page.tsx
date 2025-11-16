import ProductCategoryDetails from "@/components/ProductCategories/ProductCategoryDetails";
import { cookies } from "next/headers";

export default async function ProductCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value || "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/productCategory/${id}`,
    { headers: { authorization: accessToken } }
  );
  const result = await response.json();
  const data = result.data;

  return (
    <div className="p-4 md:p-6">
      <ProductCategoryDetails category={data} />
    </div>
  );
}
