import NearbyPartners from "@/components/Dashboard/Orders/NearbyPartners";
import { getNearbyPartnersForOrders } from "@/services/dashboard/order/order.service";


interface IProps {
    params: Promise<{ id: string }>;
}


const OrderNearbyPartnersPage = async ({ params }: IProps) => {
    const { id } = await params;
    const partnersResult = await getNearbyPartnersForOrders(id);


    return (
        <div>
            <NearbyPartners nearbyPartners={partnersResult?.data} />
        </div>
    );
};

export default OrderNearbyPartnersPage;