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
    const vendorMongoId = vendorData?._id as string;

    // Normalize search params (Next may give string | string[])
    const flatParams: Record<string, string> = {};
    Object.entries(searchParamsObj).forEach(([key, value]) => {
        if (value === undefined) return;
        flatParams[key] = Array.isArray(value) ? value[0] : value;
    });

    // Tabs are independent:
    //   SDR tab      -> sdr.applicable=true (status is NOT sent)
    //   All tab      -> meta.status=ALL     (UI-only value, nothing sent)
    //   Active/Inactive -> meta.status=ACTIVE | INACTIVE
    //   nothing in URL  -> default ACTIVE
    const {
        "meta.status": urlStatus,
        "sdr.applicable": urlSdr,
        ...otherParams
    } = flatParams;

    const isSdr = urlSdr === "true";
    const status = isSdr ? undefined : urlStatus || "ACTIVE";

    const hasSort =
        Boolean(flatParams.sortBy) ||
        Boolean(flatParams.sort) ||
        Boolean(flatParams.sortOption);

    const productsQueryObj: Record<string, string> = {
        vendorId: vendorMongoId,
        limit: "30",
        page: flatParams.page || "1",
        ...otherParams, // search term etc.
        ...(isSdr ? { "sdr.applicable": "true" } : {}),
        ...(status && status !== "ALL" ? { "meta.status": status } : {}),
        ...(hasSort ? {} : { sortBy: "name" }),
    };
    if (!productsQueryObj.limit) productsQueryObj.limit = "30";

    // ── tab counts: same search, but WITHOUT tab params / sort / paging
    const countBase: Record<string, string> = { ...otherParams };
    ["page", "limit", "sortBy", "sort", "sortOption"].forEach(
        (k) => delete countBase[k]
    );
    countBase.vendorId = vendorMongoId;
    countBase.limit = "1";
    countBase.page = "1";

    const getTotal = async (extra: Record<string, string> = {}) => {
        const q = queryStringFormatter({ ...countBase, ...extra });
        const res = await getAllProducts(q);
        return (res?.meta?.total ?? res?.data?.meta?.total ?? 0) as number;
    };

    // ⭐ Categories: NEVER spread product filters
    const categoriesQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "100",
        isDeleted: false,
        isActive: true,
    });

    // ⭐ Everything in parallel
    const [
        productsRes,
        allCount,
        activeCount,
        inactiveCount,
        sdrCount,
        productCategories,
    ] = await Promise.all([
        getAllProducts(queryStringFormatter(productsQueryObj)),
        getTotal(),
        getTotal({ "meta.status": "ACTIVE" }),
        getTotal({ "meta.status": "INACTIVE" }),
        getTotal({ "sdr.applicable": "true" }),
        getAllProductCategories(categoriesQuery),
    ]);

    const { data, meta } = productsRes;

    // filters only (no paging / vendor) – used by the client to load the rest
    const {
        page: _p,
        limit: _l,
        vendorId: _v,
        ...baseQueryObj
    } = productsQueryObj;
    const baseQuery = queryStringFormatter(baseQueryObj);

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
                statusCounts={{
                    all: allCount,
                    active: activeCount,
                    inactive: inactiveCount,
                    sdr: sdrCount,
                }}
                vendorMongoId={vendorMongoId}
                vendorId={id}
            />
        </div>
    );
};

export default ManageProductsPage;