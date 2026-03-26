import VendorDetails from "@/components/Dashboard/Vendors/VendorDetails/VendorDetails";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";

export default async function VendorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendorData: TVendor = await getSingleVendorReq(id);
  let offerData: TOffer[] = [];

  if (vendorData._id) {
    const offerResult = await getAllOffersReq({
      vendorId: vendorData._id,
      limit: "4",
    });
    offerData = offerResult.data;
  }

  return <VendorDetails vendor={vendorData} offerData={offerData} />;
}
