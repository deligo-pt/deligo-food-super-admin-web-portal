
import ProductsSection from "@/components/Dashboard/Vendors/VendorDetails/Products/ProductsSection";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TProductCategoryResponse } from "@/types/category.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

const ManageProductsPage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const query = { vendorId: vendorData?._id };
    const queryString = queryStringFormatter(query);
    const { data, meta } = await getAllProducts(queryString);
    const productCategories = await getAllProductCategories(queryString);


    return (
        <div>
            <ProductsSection
                productCategories={productCategories?.data as TProductCategoryResponse[]}
                businessTypeSlug={vendorData?.businessDetails?.businessTypeSlug as string}
                productsData={{ data, meta: meta! }}
                vendorId={vendorData?.userId}
            />
        </div>
    );
};

export default ManageProductsPage;