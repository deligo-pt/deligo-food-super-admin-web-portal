import { getAllAgreements } from '@/services/dashboard/agreement/agreement.service';
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
            All the agreements with versions here
        </div>
    );
};

export default AllAgreementsVersionPage;