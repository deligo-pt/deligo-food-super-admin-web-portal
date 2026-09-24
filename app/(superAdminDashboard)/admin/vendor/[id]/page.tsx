import VendorDetails from "@/components/Dashboard/Vendors/VendorDetails/VendorDetails";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";

export default async function VendorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vendorData: TVendor = await getSingleVendorReq(id);

  return <VendorDetails
    vendor={vendorData}
  />;
}
