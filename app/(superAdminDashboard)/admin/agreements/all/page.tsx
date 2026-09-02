
import AllAgreementVersions from '@/components/Dashboard/Agreements/AllAgreementVersions';
import { getAllAgreements } from '@/services/dashboard/agreement/agreement.service';
import { IAgreementVersionResponse } from '@/types/agreement.type';
import { queryStringFormatter } from '@/utils/formatter';

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllAgreementsVersionPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const agreements = await getAllAgreements(queryString);


    return (
        <div>
            <AllAgreementVersions agreeVersionsData={agreements as IAgreementVersionResponse} />
        </div>
    );
};

export default AllAgreementsVersionPage;