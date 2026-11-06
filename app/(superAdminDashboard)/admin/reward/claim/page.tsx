
import AllRewardClaims from "@/components/Dashboard/Reward&Claims/AllRewardClaim";
import { getAllClaimedRewards } from "@/services/dashboard/reward&claims/reward-claims.service";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const RewardClaimsPage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const result = await getAllClaimedRewards(queryString);

    return (
        <div>
            <AllRewardClaims datas={{ data: result?.data, meta: result?.meta }} />
        </div>
    );
};

export default RewardClaimsPage;