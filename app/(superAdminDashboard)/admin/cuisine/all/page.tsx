import AllCuisine from "@/components/Dashboard/cuisine/AllCuisine";
import { getAllCuisine } from "@/services/dashboard/category/cuisine.service";


const AllCuisinePage = async () => {
    const cuisineData = await getAllCuisine();
    console.log("cuisine result", cuisineData);

    return (
        <div>
            <AllCuisine cuisineResult={cuisineData} />
        </div>
    );
};

export default AllCuisinePage;