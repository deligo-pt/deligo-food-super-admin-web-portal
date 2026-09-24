import ProductCategories from "@/components/Dashboard/Vendors/VendorDetails/Products/ProductCategories";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TMeta } from "@/types";
import { TProductCategoryResponse } from "@/types/category.type";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const ProductCategoriesForVendor = async ({ params, searchParams }: IProps) => {
    const { id } = await params;
    const searchParamsObj = await searchParams;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const query = { vendorId: vendorData?._id, ...searchParamsObj };
    const queryString = queryStringFormatter(query);
    const productCategories = await getAllProductCategories(queryString);

    return (
        <>
            <ProductCategories
                vendor={vendorData}
                categoriesResult={productCategories as { data: TProductCategoryResponse[], meta: TMeta }}
            />
        </>
    );
};

export default ProductCategoriesForVendor;