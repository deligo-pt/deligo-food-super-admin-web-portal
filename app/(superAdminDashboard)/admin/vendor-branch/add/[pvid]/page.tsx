import AddVendorBranch from "@/components/Dashboard/Vendors/VendorBranch/AddVendorBranch";
import { getAllBusinessCategoriesReq } from "@/services/dashboard/category/business-category.service";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";

interface IProps {
    params: Promise<{ pvid: string }>;
}

const AddVendorBranchPage = async ({ params }: IProps) => {
    const { pvid } = await params;
    const result = await getAllCuisine();
    const businessCategoriesRes = await getAllBusinessCategoriesReq();


    return <AddVendorBranch businessCategories={businessCategoriesRes?.data} cuisines={result?.data} vendorId={pvid} />;
};

export default AddVendorBranchPage;