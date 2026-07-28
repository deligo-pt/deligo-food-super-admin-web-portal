import AdminDetails from '@/components/Dashboard/Admins/AdminDetails';
import { getSingleAdmin } from '@/services/dashboard/admin/admin.service';

interface IProps {
    params: {
        id: string;
    };
};

const AdminDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const adminDetails = await getSingleAdmin(id);

    return (
        <div>
            <AdminDetails admin={adminDetails?.data} />
        </div>
    );
};

export default AdminDetailsPage;