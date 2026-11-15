import OrderDetails from "@/components/Dashboard/Orders/OrderDetails/OrderDetails";
import { getSingleOrderReq } from "@/services/dashboard/order/order.service";
import { getOrderRatingsReq } from "@/services/dashboard/rating/rating.service";
import { TOrder } from "@/types/order.type";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initialData: TOrder = await getSingleOrderReq(id);

  // Stars and comments are not on the order; fetch them only when it's rated.
  const ratings =
    initialData?.isRated && initialData?._id
      ? await getOrderRatingsReq(initialData._id)
      : { ok: true as const, data: [] };

  return (
    <OrderDetails
      order={initialData}
      ratings={ratings.data}
      ratingsLoaded={ratings.ok}
    />
  );
}
