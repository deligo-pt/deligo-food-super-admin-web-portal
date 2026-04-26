import RestrictedItems from "@/components/Dashboard/Items/RestrictedItems/RestrictedItems";
import { getAllRestrictedItemsReq } from "@/services/dashboard/product/restricted-item.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function RestrictedItemsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const restrictedItemsData = await getAllRestrictedItemsReq(queries);

  return <RestrictedItems restrictedItemsData={restrictedItemsData} />;
}
