import ProductsSection from "@/components/Dashboard/Vendors/VendorDetails/Products/ProductsSection";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TProductCategoryResponse } from "@/types/category.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ManageProductsPage = async ({ params, searchParams }: IProps) => {
    const { id } = await params;
    const searchParamsObj = await searchParams;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const vendorMongoId = vendorData?._id;

    const productsQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "30",
        page: "1",
        sortBy: "name",
        ...searchParamsObj
    });
    const { data, meta } = await getAllProducts(productsQuery);

    // Categories – keep a high limit so all categories appear
    const categoriesQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "30",
        sortBy: "name",
        ...searchParamsObj
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
                vendorMongoId={vendorMongoId}
                vendorId={id}
            />
        </div>
    );
};

export default ManageProductsPage;