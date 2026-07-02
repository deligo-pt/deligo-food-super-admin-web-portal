import AdminDetails from '@/components/Dashboard/Admins/AdminDetails';
import { getSingleAdmin } from '@/services/dashboard/admin/admin.service';
import React from 'react';

interface IProps {
    params: {
        id: string;
    };
};

const AdminDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const adminDetails = await getSingleAdmin(id);
    console.log("Admin Details: ", adminDetails);
    return (
        <div>
            <AdminDetails admin={adminDetails?.data} />
        </div>
    );
};

export default AdminDetailsPage;