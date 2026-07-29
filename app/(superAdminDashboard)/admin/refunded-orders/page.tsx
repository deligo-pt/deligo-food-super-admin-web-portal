import Orders from "@/components/Dashboard/Orders/Orders";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
    searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function RefundedOrdersPage({ searchParams }: IProps) {
    const queries = (await searchParams) || {};
    const ordersResult = await getAllOrdersReq({
        ...queries,
        paymentStatus: "REFUNDED",
    });

    return (
        <Orders
            ordersResult={ordersResult}
            title="refunded_orders"
            subtitle="refunded_orders_desc"
        />
    );
}
