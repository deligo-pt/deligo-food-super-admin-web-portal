import Orders from "@/components/Dashboard/Orders/Orders";
import { ORDER_STATUS } from "@/consts/order.const";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function OnTheWayOrdersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const ordersResult = await getAllOrdersReq({
    ...queries,
    orderStatus: ORDER_STATUS.ON_THE_WAY,
  });

  return (
    <Orders
      ordersResult={ordersResult}
      title="on_the_way_orders"
      subtitle="the_orders_that_on_the_way_to_customer"
    />
  );
}
