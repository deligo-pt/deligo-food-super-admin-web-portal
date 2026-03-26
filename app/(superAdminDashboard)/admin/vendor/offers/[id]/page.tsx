import VendorOffers from "@/components/Dashboard/Offers/VendorOffers/VendorOffers";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TMeta } from "@/types";
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

  const vendorData: TVendor = await getSingleVendorReq(id);
  let offerData: { data: TOffer[]; meta?: TMeta } = { data: [] };

  if (vendorData._id) {
    offerData = await getAllOffersReq({
      ...queries,
      vendorId: vendorData._id,
    });
  }

  return <VendorOffers vendor={vendorData} offersResult={offerData} />;
}
