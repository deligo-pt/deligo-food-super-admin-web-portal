/* eslint-disable @typescript-eslint/no-explicit-any */
import DeliveryExceptions from '@/components/Dashboard/Orders/DeliveryExceptions/DeliveryExceptions';
import { getDeliveryExceptions } from '@/services/dashboard/order/order.service';
import { TMeta } from '@/types';


const DeliveryExceptionsPage = async () => {
    const exceptionsData = await getDeliveryExceptions();

    return (
        <div>
            <DeliveryExceptions exceptionsData={exceptionsData as { data: any[], meta: TMeta }} />
        </div>
    );
};

export default DeliveryExceptionsPage;