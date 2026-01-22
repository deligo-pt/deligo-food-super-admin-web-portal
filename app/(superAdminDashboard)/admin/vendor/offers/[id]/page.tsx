import VendorOffers from "@/components/Dashboard/Offers/VendorOffers/VendorOffers";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";

type IProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
};
export default async function VendorOffersPage({
  params,
  searchParams,
}: IProps) {
  const { id } = await params;

  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  let vendorData: TVendor = {} as TVendor;
  const offerData: { data: TOffer[]; meta?: TMeta } = { data: [] };

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

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { isActive: status === "active" } : {}),
    vendorId: vendorData._id,
  };

  try {
    const result = (await serverRequest.get("/offers", {
      params: query,
    })) as TResponse<{ data: TOffer[]; meta?: TMeta }>;

    if (result?.success) {
      offerData.data = result.data.data;
      offerData.meta = result.data.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <VendorOffers vendor={vendorData} offersResult={offerData} />;
}
