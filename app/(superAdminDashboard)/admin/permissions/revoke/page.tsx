import RevokePermissions from "@/components/Dashboard/Permissions/RevokePermissions";
import { getAllAdmin } from "@/services/dashboard/admin/admin.service";


const RevokePermission = async () => {
    const adminResult = await getAllAdmin();

    return (
        <div>
            <RevokePermissions admins={adminResult?.data} />
        </div>
    );
};

export default RevokePermission;