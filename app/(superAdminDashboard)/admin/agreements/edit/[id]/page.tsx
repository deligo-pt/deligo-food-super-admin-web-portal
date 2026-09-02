import EditDraftAgreement from "@/components/Dashboard/Agreements/EditDraftAgreement";
import { getSingleAgreementVersion } from "@/services/dashboard/agreement/agreement.service";

interface IProps {
    params: Promise<{ id: string }>
}

const EditAgreementVersionsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const { data } = await getSingleAgreementVersion(id);

    return (
        <div>
            <EditDraftAgreement agreement={data} />
        </div>
    );
};

export default EditAgreementVersionsPage;