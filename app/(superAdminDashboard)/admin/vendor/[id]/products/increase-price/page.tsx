
import IncreasePrice from '@/components/Dashboard/Vendors/VendorDetails/Products/IncreasePrice';
import { getAllProductCategories } from '@/services/dashboard/category/product-category.service';
import { getAllProducts } from '@/services/dashboard/product/product.service';
import { getSingleVendorReq } from '@/services/dashboard/vendor/vendor.service';
import { TVendor } from '@/types/user.type';
import { queryStringFormatter } from '@/utils/formatter';

const IncreasePricePage = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const query = { "meta.status": "ACTIVE", vendorId: vendorData?._id };
    const queryString = queryStringFormatter(query);
    const { data } = await getAllProducts(queryString);

    const productQuery = new URLSearchParams({
        vendorId: vendorData?._id as string,
    }).toString();

    const productCategries = await getAllProductCategories(productQuery);

    return (
        <div>
            <IncreasePrice products={data} productCategries={productCategries?.data} />
        </div>
    );
};

export default IncreasePricePage;