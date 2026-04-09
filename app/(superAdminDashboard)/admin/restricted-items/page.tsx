import RestrictedItems from "@/components/Dashboard/Items/RestrictedItems/RestrictedItems";
import { TRestrictedItem } from "@/types/product.type";

const sampleData: TRestrictedItem[] = [
  {
    _id: "r-1",
    name: "Alcohol - Whiskey",
    category: "ALCOHOL",
    reason: "Age restricted (18+)",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "r-2",
    name: "Cigarettes",
    category: "TOBACCO",
    reason: "Legal restriction (no sales)",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    _id: "r-3",
    name: "Sharp Knives",
    category: "DANGEROUS_GOODS",
    reason: "Safety risk for delivery",
    updatedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

export default function RestrictedItemsPage() {
  const restrictedItemsData = {
    data: sampleData,
    meta: {
      total: sampleData.length,
      page: 1,
      limit: 10,
      totalPage: 1,
    },
  };

  return <RestrictedItems restrictedItemsData={restrictedItemsData} />;
}
