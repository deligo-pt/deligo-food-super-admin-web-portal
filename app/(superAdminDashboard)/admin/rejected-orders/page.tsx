import Orders from "@/components/Dashboard/Orders/Orders";
import { ORDER_STATUS } from "@/consts/order.const";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
    searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function RejectedOrdersPage({ searchParams }: IProps) {
    const queries = (await searchParams) || {};
    const ordersResult = await getAllOrdersReq({
        ...queries,
        orderStatus: ORDER_STATUS.REJECTED,
    });

    return (
        <Orders
            ordersResult={ordersResult}
            title="rejected_orders"
            subtitle="rejected_orders_desc"
        />
    );
}
