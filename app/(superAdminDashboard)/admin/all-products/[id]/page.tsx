import ProductDetails from "@/components/AllProducts/ProductDetails.tsx/ProductDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TProduct } from "@/types/product.type";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialData: TProduct = {} as TProduct;

  try {
    const result = (await serverRequest.get(
      `/products/${id}`
    )) as unknown as TResponse<TProduct>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.error("Server fetchProducts error:", err);
  }
  return <ProductDetails product={initialData} />;
}
