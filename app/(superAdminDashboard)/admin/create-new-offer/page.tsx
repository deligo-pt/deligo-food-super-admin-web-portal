
import CreateNewOffer from "@/components/CreateNewOffer/CreateNewOffer";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { queryStringFormatter } from "@/utils/formatter";

export default async function CreateNewOfferPage() {
  const productsQuery = queryStringFormatter({
    limit: "30",
    page: "1",
    isDeleted: false,
    "meta.status": "ACTIVE",
  });
  const { data, meta } = await getAllProducts(productsQuery);

  const categoriesQuery = queryStringFormatter({
    limit: "50",
    isDeleted: false,
    isActive: true,
  });
  const productCategories = await getAllProductCategories(categoriesQuery);

  return (
    <CreateNewOffer
      itemsResult={{ data, meta }}
      productCategories={{
        data: productCategories?.data,
        meta: productCategories?.meta,
      }}
    />
  );
}