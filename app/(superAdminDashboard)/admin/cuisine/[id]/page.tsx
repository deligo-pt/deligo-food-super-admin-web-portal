import CuisineDetails from "@/components/Dashboard/cuisine/CuisineDetails";
import { getSingleCuisine } from "@/services/dashboard/category/cuisine.service";


interface IProps {
    params: Promise<{ id: string }>;
}

const CuisineDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;
    const cuisineDetails = await getSingleCuisine(id);

    return (
        <div>
            <CuisineDetails cuisine={cuisineDetails?.data} />
        </div>
    );
};

export default CuisineDetailsPage;