import { VendorDetails } from "@/components/AllVendors/VendorDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";

export default async function VendorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let vendorData: TVendor = {} as TVendor;
  let offerData: TOffer[] = [];

  try {
    const result = (await serverRequest.get(
      `/vendors/${id}`,
    )) as TResponse<TVendor>;

    if (result?.success) {
      vendorData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  try {
    const result = (await serverRequest.get("/offers", {
      params: { vendorId: vendorData._id, limit: 4, page: 1 },
    })) as TResponse<{ data: TOffer[]; meta?: TMeta }>;

    if (result?.success) {
      offerData = result.data.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <VendorDetails vendor={vendorData} offerData={offerData} />;
}
