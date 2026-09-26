import AddOnsManagementSection from '@/components/Dashboard/Vendors/VendorDetails/AddonsManagementSection';
import { getAllAddOnsGroup } from '@/services/dashboard/product/product.service';
import { getAllTaxes } from '@/services/dashboard/tax/tax.service';
import { getSingleVendorReq } from '@/services/dashboard/vendor/vendor.service';
import { TMeta } from '@/types';
import { TAddonGroup } from '@/types/add-ons.type';
import { TVendor } from '@/types/user.type';
import { queryStringFormatter } from '@/utils/formatter';

interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AddOnsForVendor = async ({ params, searchParams }: IProps) => {
    const { id } = await params;
    const searchParamsObj = await searchParams;

    const vendorData: TVendor = await getSingleVendorReq(id);

    const query = { vendorId: vendorData?._id, ...searchParamsObj };
    const queryString = queryStringFormatter(query);
    const addonGroupsData = await getAllAddOnsGroup(queryString);
    const taxes = await getAllTaxes();

    return (
        <div>
            <AddOnsManagementSection
                vendorId={vendorData?._id}
                vendorUserId={vendorData?.userId}
                addonGroupsResult={addonGroupsData as { data: TAddonGroup[], meta: TMeta }}
                taxes={taxes?.data}
            />
        </div>
    );
};

export default AddOnsForVendor;