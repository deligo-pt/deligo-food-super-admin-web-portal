import ProductDetails from "@/components/AllProducts/ProductDetails.tsx/ProductDetails";
import { getSingleProductReq } from "@/services/dashboard/product/product.service";
import { TProduct } from "@/types/product.type";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData: TProduct = await getSingleProductReq(id);

  return <ProductDetails product={initialData} />;
}
