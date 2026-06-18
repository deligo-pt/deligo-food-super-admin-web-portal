import PermissionDetails from '@/components/Dashboard/Permissions/PermissionDetails';
import { getSinglePermissionReq } from '@/services/dashboard/permissions/permissons.service';
import React from 'react';

const PermissionDetailsPage = async ({
    params,
}: {
    params: Promise<{ id: string }>;
}) => {
    const { id } = await params;
    const permission = await getSinglePermissionReq(id);

    return (
        <div>
            <PermissionDetails permission={permission} />
        </div>
    );
};

export default PermissionDetailsPage;