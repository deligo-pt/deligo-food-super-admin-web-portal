export const dynamic = "force-dynamic";

import AddVendor from "@/components/AddVendor/AddVendor";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TBusinessCategory } from "@/types/category.type";

export default async function AddVendorPage() {
  let businessCategories: TBusinessCategory[] = [];

  try {
    const result = (await serverRequest.get(
      "/categories/businessCategory",
    )) as unknown as TResponse<{ data: TBusinessCategory[] }>;

    if (result?.success) {
      businessCategories = result?.data?.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <AddVendor businessCategories={businessCategories} />;
}
