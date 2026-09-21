import VendorDetails from "@/components/Dashboard/Vendors/VendorDetails/VendorDetails";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllOffersReq } from "@/services/dashboard/offer/offer.service";
import { getAllAddOnsGroup } from "@/services/dashboard/product/product.service";
import { getAllTaxes } from "@/services/dashboard/tax/tax.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TMeta } from "@/types";
import { TAddonGroup } from "@/types/add-ons.type";
import { TProductCategoryResponse } from "@/types/category.type";
import { TOffer } from "@/types/offer.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

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

  const query = { vendorId: vendorData?._id };
  const queryString = queryStringFormatter(query);
  const productCategories = await getAllProductCategories(queryString);
  const addonGroupsData = await getAllAddOnsGroup(queryString);
  const taxes = await getAllTaxes();


  return <VendorDetails
    vendor={vendorData}
    offerData={offerData}
    categoriesResult={productCategories as { data: TProductCategoryResponse[], meta: TMeta }}
    addonGroupsResult={addonGroupsData as { data: TAddonGroup[], meta: TMeta }}
    taxes={taxes?.data}
  />;
}
