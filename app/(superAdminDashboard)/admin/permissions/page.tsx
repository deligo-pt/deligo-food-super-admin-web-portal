import Permissions from "@/components/Dashboard/Permissions/Permissions";
import { getAllPermissionsReq } from "@/services/dashboard/permissions/permissons.service";
import { IPermissionResponse } from "@/types/permission.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}


const PermissionsPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const permissionsResult = await getAllPermissionsReq(queryString);

    return (
        <div>
            <Permissions permissionsResult={permissionsResult as IPermissionResponse} />
        </div>
    );
};

export default PermissionsPage;