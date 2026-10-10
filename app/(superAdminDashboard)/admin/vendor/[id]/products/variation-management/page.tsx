import VariationManagement from "@/components/Dashboard/Vendors/VendorDetails/Products/VariationManagement/VariationManagement";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VendorVariationManagementPage = async ({ params, searchParams }: IProps) => {
    const { id } = await params;
    const searchParamsObj = await searchParams;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const vendorMongoId = vendorData?._id;

    const productsQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "30",
        page: "1",
        ...searchParamsObj
    });

    const { data, meta } = await getAllProducts(productsQuery);

    return (
        <div>
            <VariationManagement
                productsData={{ data, meta: meta! }}
                businessTypeSlug={vendorData?.businessDetails?.businessTypeSlug as string}
                vendorMongoId={vendorMongoId}
                 vendorId={id}
            />
        </div>
    );
};

export default VendorVariationManagementPage;