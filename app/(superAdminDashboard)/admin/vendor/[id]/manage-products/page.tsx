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

    // Normalize search params (Next may give string | string[])
    const flatParams: Record<string, string> = {};
    Object.entries(searchParamsObj).forEach(([key, value]) => {
        if (value === undefined) return;
        flatParams[key] = Array.isArray(value) ? value[0] : value;
    });

    const hasStatusFilter = Boolean(flatParams["meta.status"]) || Boolean(flatParams["sdr"]);

    const hasSort =
        Boolean(flatParams.sortBy) ||
        Boolean(flatParams.sort) ||
        Boolean(flatParams.sortOption);


    // Default: only ACTIVE products when no status/sdr in URL
    const productsQueryObj: Record<string, string> = {
        vendorId: vendorMongoId as string,
        limit: "30",
        page: flatParams.page || "1",
        ...flatParams,
        ...(hasStatusFilter ? {} : { "meta.status": "ACTIVE" }),
        ...(hasSort ? {} : { sortBy: "name" }),
    };

    const productsQuery = queryStringFormatter(productsQueryObj);
    const { data, meta } = await getAllProducts(productsQuery);

    // filters only (no paging / vendor) – used by the client to load the rest
    const { page: _p, limit: _l, vendorId: _v, ...baseQueryObj } = productsQueryObj;
    const baseQuery = queryStringFormatter(baseQueryObj);

    // Categories: NEVER spread product filters (meta.status, sdr, sortBy, searchTerm…)
    const categoriesQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "100",
        isDeleted: false,
        isActive: true,
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
                baseQuery={baseQuery}
                vendorMongoId={vendorMongoId}
                vendorId={id}
            />
        </div>
    );
};

export default ManageProductsPage;