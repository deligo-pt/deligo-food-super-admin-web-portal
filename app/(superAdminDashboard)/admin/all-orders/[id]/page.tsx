import OrderDetails from "@/components/Dashboard/Orders/OrderDetails/OrderDetails";
import { getSingleOrderReq } from "@/services/dashboard/order/order.service";
import { TOrder } from "@/types/order.type";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData: TOrder = await getSingleOrderReq(id);

  return <OrderDetails order={initialData} />;
}
