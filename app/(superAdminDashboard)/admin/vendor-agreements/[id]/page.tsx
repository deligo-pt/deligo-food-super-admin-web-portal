import AgreementDetails from '@/components/Dashboard/VendorAgreement/AgreementDetails';
import { getSingleAgreement } from '@/services/dashboard/agreement/agreement.service';


type IParams = {
    params: Promise<{ id: string }>;
};

const AgreementDetailsPage = async ({ params }: IParams) => {
    const { id } = await params;
    const agreement = await getSingleAgreement(id);

    return (
        <>
            <AgreementDetails agreement={agreement} />
        </>
    );
};

export default AgreementDetailsPage;