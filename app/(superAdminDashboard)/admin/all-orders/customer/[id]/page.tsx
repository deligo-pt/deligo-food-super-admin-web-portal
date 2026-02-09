import Orders from "@/components/Dashboard/Orders/Orders";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TOrder } from "@/types/order.type";
import { TCustomer } from "@/types/user.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
  params: Promise<{ id: string }>;
};

export default async function CustomerOrdersPage({
  params,
  searchParams,
}: IProps) {
  const { id } = await params;

  let customer: TCustomer = {} as TCustomer;
  const initialData: { data: TOrder[]; meta?: TMeta } = { data: [] };

  try {
    const customerResult = (await serverRequest.get(
      `/customers/${id}`,
    )) as TResponse<TCustomer>;

    if (customerResult?.success) {
      customer = customerResult.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  if (customer?._id) {
    const queries = (await searchParams) || {};
    const limit = Number(queries?.limit || 10);
    const page = Number(queries.page || 1);
    const searchTerm = queries.searchTerm || "";
    const sortBy = queries.sortBy || "-createdAt";

    const query = {
      limit,
      page,
      sortBy,
      customerId: customer._id,
      ...(searchTerm ? { searchTerm: searchTerm } : {}),
    };

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
  }

  return (
    <Orders
      ordersResult={initialData}
      title={
        customer.name?.firstName || customer.name?.lastName
          ? `Orders from ${customer?.name?.firstName} ${customer?.name?.lastName}`
          : "Customer Orders"
      }
      subtitle="Manage customer orders here"
    />
  );
}
