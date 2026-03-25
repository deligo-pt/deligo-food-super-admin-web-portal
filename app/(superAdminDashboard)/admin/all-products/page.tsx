import AllProducts from "@/components/AllProducts/AllProducts";
import { getAllProductsReq } from "@/services/dashboard/product/product.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ProductsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const productsResult = await getAllProductsReq(queries);

  return <AllProducts initialData={productsResult} />;
}
