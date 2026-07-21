import LoginHistoryDetail from '@/components/Dashboard/LoginHistory/LoginHistoryDetails';
import { getSingleLoginHistory } from '@/services/dashboard/fleet-manager/login-history.service';
import { TLoginHistory } from '@/types/login-history.type';


interface IProps {
    params: {
        id: string;
    };
};


const LoginHistoryDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const loginHistoryDetails = await getSingleLoginHistory(id);

    return (
        <div>
            <LoginHistoryDetail loginHistoryDetail={loginHistoryDetails as TLoginHistory} />
        </div>
    );
};

export default LoginHistoryDetailsPage;