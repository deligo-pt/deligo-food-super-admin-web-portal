import Orders from "@/components/Dashboard/Orders/Orders";
import { ORDER_TYPE } from "@/consts/order.const";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
    searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ScheduledOrdersPage({ searchParams }: IProps) {
    const queries = (await searchParams) || {};
    const ordersResult = await getAllOrdersReq({
        ...queries,
        orderType: ORDER_TYPE.SCHEDULED,
    });

    return (
        <Orders
            ordersResult={ordersResult}
            title="scheduled_orders"
            subtitle="all_scheduled_orders_system"
        />
    );
}
