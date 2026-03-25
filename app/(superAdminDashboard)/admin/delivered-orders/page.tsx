import Orders from "@/components/Dashboard/Orders/Orders";
import { ORDER_STATUS } from "@/consts/order.const";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveredOrdersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const ordersResult = await getAllOrdersReq({
    ...queries,
    orderStatus: ORDER_STATUS.DELIVERED,
  });

  return (
    <Orders
      ordersResult={ordersResult}
      title="Delivered Orders"
      subtitle="Successfully delivered orders are listed here."
    />
  );
}
