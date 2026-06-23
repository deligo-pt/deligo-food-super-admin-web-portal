import AllCuisine from "@/components/Dashboard/cuisine/AllCuisine";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";
import { TMeta } from "@/types";
import { TCuisine } from "@/types/cuisine.type";


const AllCuisinePage = async () => {
    const cuisineData = await getAllCuisine();

    return (
        <div>
            <AllCuisine cuisineResult={cuisineData as {data : TCuisine[] , meta : TMeta}} />
        </div>
    );
};

export default AllCuisinePage;