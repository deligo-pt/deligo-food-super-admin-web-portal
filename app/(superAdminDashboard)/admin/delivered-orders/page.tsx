import DeliveredOrders from "@/components/DeliveredOrders/DeliveredOrders";
import { ORDER_STATUS } from "@/consts/order.const";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOrder } from "@/types/order.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveredOrdersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const initialData: { data: TOrder[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/orders", {
      params: { ...query, orderStatus: ORDER_STATUS.DELIVERED },
    })) as unknown as TResponse<TOrder[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta as TMeta;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <DeliveredOrders ordersResult={initialData} />;
}
