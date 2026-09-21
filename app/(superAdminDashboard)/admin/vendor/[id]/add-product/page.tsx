import { AddProductToVendor } from "@/components/Dashboard/Vendors/AddProduct/AddProductToVendor";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllAddOnsGroup } from "@/services/dashboard/product/product.service";
import { getAllTaxes } from "@/services/dashboard/tax/tax.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";


const AddProductToVendorPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const query = { vendorId: vendorData?._id };
    const queryString = queryStringFormatter(query);
    const taxResults = await getAllTaxes();
    const productCategories = await getAllProductCategories(queryString);
    const addonGroupsData = await getAllAddOnsGroup(queryString);

    return (
        <div>
            <AddProductToVendor
                productCategories={productCategories?.data}
                addonGroupsData={addonGroupsData?.data}
                taxesData={taxResults?.data}
                businessTypeSlug={vendorData?.businessDetails?.businessTypeSlug as string}
                vendor={vendorData}
            />
        </div>
    );
};

export default AddProductToVendorPage;