import AgreementVersionsDetails from "@/components/Dashboard/Agreements/AgreementVersionsDetails";
import { getAllCommissionRates, getEffectiveCommissionRate, getSingleAgreementVersion } from "@/services/dashboard/agreement/agreement.service";
import { getAllTaxes } from "@/services/dashboard/tax/tax.service";

interface IProps {
    params: Promise<{ id: string }>
}

const AgreementVersionsDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const { data } = await getSingleAgreementVersion(id);
    const { data: effectiveRate } = await getEffectiveCommissionRate();
    const { data: allCommissionRates } = await getAllCommissionRates();
    const { data: taxes } = await getAllTaxes();

    return (
        <div>
            <AgreementVersionsDetails
                agreeVersion={data}
                effectiveRate={effectiveRate}
                allCommissionRates={allCommissionRates}
                taxes={taxes}
            />
        </div>
    );
};

export default AgreementVersionsDetailsPage;