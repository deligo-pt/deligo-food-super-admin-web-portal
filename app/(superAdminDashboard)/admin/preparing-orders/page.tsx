import Orders from "@/components/Dashboard/Orders/Orders";
import { ORDER_STATUS } from "@/consts/order.const";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOrder } from "@/types/order.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function PreparingOrdersPage({ searchParams }: IProps) {
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
    orderStatus: ORDER_STATUS.PREPARING,
  };

  const initialData: { data: TOrder[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/orders", {
      params: query,
    })) as TResponse<TOrder[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return (
    <Orders
      ordersResult={initialData}
      title="Preparing Orders"
      subtitle="All preparing orders in the system"
    />
  );
}
