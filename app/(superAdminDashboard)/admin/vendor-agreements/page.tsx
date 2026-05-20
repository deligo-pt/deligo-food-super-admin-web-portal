import Agreements from "@/components/Dashboard/VendorAgreement/Agreements";
import { getAllVendorAgreements } from "@/services/dashboard/agreement/agreement.service";
import { queryStringFormatter } from "@/utils/formatter";


interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const VendorAgreementsPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const agreementsData = await getAllVendorAgreements(queryString);

    return (
        <>
            <Agreements agreementsResult={agreementsData} />
        </>
    );
};

export default VendorAgreementsPage;