import DeliveryPartnerLiveTracking from "@/components/Dashboard/DeliveryPartners/LiveTracking/DeliveryPartnerLiveTracking";
import { getAllDeliveryPartners } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { TMeta } from "@/types";
import { currentStatusOptions, TDeliveryPartner } from "@/types/delivery-partner.type";
import { queryStringFormatter } from "@/utils/formatter";


const DeliveryPartnerLiveTrackingPage = async () => {
    const queryString = queryStringFormatter({
        limit: "50",
        page: "1",
        sortBy: "-updatedAt",
        status: "APPROVED",
        "operationalData.currentStatus": currentStatusOptions.IDLE || currentStatusOptions.ON_DELIVERY,
    });


    const partnersData = await getAllDeliveryPartners(queryString);


    return (
        <div className="h-[calc(100dvh-1rem)]">
            <DeliveryPartnerLiveTracking
                initialData={partnersData as { data: TDeliveryPartner[]; meta: TMeta }}
            />
        </div>
    );
};

export default DeliveryPartnerLiveTrackingPage;