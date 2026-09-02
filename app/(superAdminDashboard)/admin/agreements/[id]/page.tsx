import AgreementVersionsDetails from "@/components/Dashboard/Agreements/AgreementVersionsDetails";
import { getSingleAgreementVersion } from "@/services/dashboard/agreement/agreement.service";

interface IProps {
    params: Promise<{ id: string }>
}

const AgreementVersionsDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const { data } = await getSingleAgreementVersion(id);

    return (
        <div>
            <AgreementVersionsDetails agreeVersion={data} />
        </div>
    );
};

export default AgreementVersionsDetailsPage;