import AssignPermissions from "@/components/Dashboard/Permissions/AssignPermissionPage";
import { getAllAdmin } from "@/services/dashboard/admin/admin.service";
import { getAllPermissionsReq } from "@/services/dashboard/permissions/permissons.service";


const AssignPermission = async () => {
    const adminResult = await getAllAdmin();
    const permissionResult = await getAllPermissionsReq();

    return (
        <div>
            <AssignPermissions admins={adminResult?.data} permissions={permissionResult?.data} />
        </div>
    );
};

export default AssignPermission;