import OrderDetails from "@/components/Dashboard/Orders/OrderDetails/OrderDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TOrder } from "@/types/order.type";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TOrder = {} as TOrder;

  try {
    const result = (await serverRequest.get(
      `/orders/${id}`,
    )) as TResponse<TOrder>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <OrderDetails order={initialData} />;
}
