

interface IProps {
    params: Promise<{ id: string }>;
}

const CuisineDetailsPage = async ({ params }: IProps) => {
    const { id } = await params;

    return (
        <div>

        </div>
    );
};

export default CuisineDetailsPage;