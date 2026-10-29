
import CreateNewVendorOffer from "@/components/Dashboard/Vendors/VendorDetails/Products/CreateNewVendorOffer";
import { getAllProductCategories } from "@/services/dashboard/category/product-category.service";
import { getAllProducts } from "@/services/dashboard/product/product.service";
import { getSingleVendorReq } from "@/services/dashboard/vendor/vendor.service";
import { TVendor } from "@/types/user.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const CreateNewOfferPage = async ({ params }: IProps) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const vendorMongoId = vendorData?._id;

    const productsQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "30",
        page: "1",
        isDeleted: false,
        "meta.status": "ACTIVE",
        // sortBy: "name",
    });
    const { data, meta } = await getAllProducts(productsQuery);

    // Categories – keep a high limit so all categories appear
    const categoriesQuery = queryStringFormatter({
        vendorId: vendorMongoId,
        limit: "50",
        // sortBy: "name",
        isDeleted: false,
        isActive: true
    });
    const productCategories = await getAllProductCategories(categoriesQuery);

    return (
        <div>
            <CreateNewVendorOffer
                itemsResult={{ data, meta }}
                vendorMongoId={vendorData?._id}
                vendorUserId={vendorData?.userId}
                productCategories={{ data: productCategories?.data, meta: productCategories?.meta }}
            />
        </div>
    );
};

export default CreateNewOfferPage;