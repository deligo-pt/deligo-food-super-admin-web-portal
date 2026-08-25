import Vendors from "@/components/Dashboard/Vendors/Vendors";
import { USER_ROLE } from "@/consts/user.const";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
    searchParams?: Promise<Record<string, string | undefined>>;
};

const AllVendorBranches = async ({ searchParams }: IProps) => {
    const queries = (await searchParams) || {};
    const vendorsResult = await getAllVendorsReq(queries, USER_ROLE.SUB_VENDOR);

    return (
        <Vendors
            vendorsResult={vendorsResult}
            showFilters={true}
            showButton={false}
            title="vendor_branches"
            subtitle="manage_all_registered_vendor_branches"
        />
    );
};

export default AllVendorBranches;