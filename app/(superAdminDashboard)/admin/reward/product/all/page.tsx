
import AllRewardProducts from "@/components/Dashboard/Reward&Claims/AllRewardProducts";
import { getAllRewardProducts } from "@/services/dashboard/reward&claims/reward-claims.service";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllRewardProductsPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const result = await getAllRewardProducts(queryString);

    return (
        <div>
            <AllRewardProducts datas={{ data: result?.data, meta: result?.meta }} />
        </div>
    );
};

export default AllRewardProductsPage;