import ProductsSection from "@/components/Dashboard/Vendors/VendorDetails/Products/ProductsSection";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TProductCategoryResponse } from "@/types/category.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

const ManageProductsPage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const vendorMongoId = vendorData?._id;

    const productsQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "20",
        page: "1",
    });
    const { data, meta } = await getAllProducts(productsQuery);

    // Categories – keep a high limit so all categories appear
    const categoriesQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "30",
    });
    const productCategories = await getAllProductCategories(categoriesQuery);

    return (
        <div>
            <ProductsSection
                productCategories={
                    productCategories?.data as TProductCategoryResponse[]
                }
                businessTypeSlug={
                    vendorData?.businessDetails?.businessTypeSlug as string
                }
                productsData={{ data, meta: meta! }}
                vendorId={vendorMongoId}
            />
        </div>
    );
};

export default ManageProductsPage;