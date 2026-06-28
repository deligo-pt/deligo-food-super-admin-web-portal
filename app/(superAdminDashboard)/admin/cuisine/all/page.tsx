import AllCuisine from "@/components/Dashboard/cuisine/AllCuisine";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";
import { TMeta } from "@/types";
import { TCuisine } from "@/types/cuisine.type";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AllCuisinePage = async ({ searchParams }: IProps) => {
    const searchParamsObj = await searchParams;
    const queryString = queryStringFormatter(searchParamsObj);
    const cuisineData = await getAllCuisine(queryString);

    return (
        <div>
            <AllCuisine cuisineResult={cuisineData as { data: TCuisine[], meta: TMeta }} />
        </div>
    );
};

export default AllCuisinePage;