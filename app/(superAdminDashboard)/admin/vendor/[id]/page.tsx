import VendorDetails from "@/components/Dashboard/Vendors/VendorDetails/VendorDetails";
import { getAllBranches, getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";

export default async function VendorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const vendorData: TVendor = await getSingleVendorReq(id);
  const branchesResult = await getAllBranches(id);

  return <VendorDetails
    vendor={vendorData}
    branchesResult={branchesResult as { data: TVendor[], meta: TMeta }}
  />;
}
