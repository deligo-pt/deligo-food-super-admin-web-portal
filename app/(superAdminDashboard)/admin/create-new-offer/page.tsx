import CreateNewOffer from "@/components/CreateNewOffer/CreateNewOffer";
import { getAllProductsReq } from "@/services/dashboard/product/product.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CreateNewOfferPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const productsResult = await getAllProductsReq(queries);

  return <CreateNewOffer products={productsResult?.data} />;
}
