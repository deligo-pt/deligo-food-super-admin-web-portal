import CuisineDetails from "@/components/Dashboard/cuisine/CuisineDetails";
import { getSingleCuisine } from "@/services/dashboard/category/cuisine.service";


interface IProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ lang?: string }>;
}

const CuisineDetailsPage = async ({ params, searchParams }: IProps) => {
    const { id } = await params;
    const { lang } = await searchParams;

    const cuisineDetails = await getSingleCuisine(id, lang as "en" | "pt");

    return (
        <div>
            <CuisineDetails cuisine={cuisineDetails?.data} />
        </div>
    );
};

export default CuisineDetailsPage;