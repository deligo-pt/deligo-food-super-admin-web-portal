import AllSdrDeposits from "@/components/Dashboard/Sdr/AllSdrDeposits";
import { getAllSdrDeposits } from "@/services/dashboard/sdr-deposits/sdr-deposits.service";
import { TSdrDeposit } from "@/types/sdr-deposits.type";
import { queryStringFormatter } from "@/utils/formatter";


interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllSdrDepositsPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const data = await getAllSdrDeposits(queryString);

    return (
        <div>
            <AllSdrDeposits sdrResults={data as { data: TSdrDeposit[] }} />
        </div>
    );
};

export default AllSdrDepositsPage;