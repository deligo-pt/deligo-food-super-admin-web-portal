import Orders from "@/components/Dashboard/Orders/Orders";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllOrdersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const ordersResult = await getAllOrdersReq(queries);

  return (
    <Orders
      ordersResult={ordersResult}
      title="All Orders"
      subtitle="Manage all orders here"
    />
  );
}
