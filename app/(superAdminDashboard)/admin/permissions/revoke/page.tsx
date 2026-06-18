import RevokePermissions from "@/components/Dashboard/Permissions/RevokePermissions";
import { getAllAdmin } from "@/services/dashboard/admin/admin.service";
import { getAllPermissionsReq } from "@/services/dashboard/permissions/permissons.service";


const RevokePermission = async () => {
    const adminResult = await getAllAdmin();
    const permissionResult = await getAllPermissionsReq();

    return (
        <div>
            <RevokePermissions admins={adminResult?.data} permissions={permissionResult?.data} />
        </div>
    );
};

export default RevokePermission;