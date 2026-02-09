import { CustomerDetails } from "@/components/AllCustomers/CustomerDetails/CustomerDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TOrder } from "@/types/order.type";
import { TCustomer } from "@/types/user.type";

export default async function CustomersDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let customer: TCustomer = {} as TCustomer;
  let orders: TOrder[] = [];

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
    try {
      const ordersResult = (await serverRequest.get("/orders", {
        params: { customerId: customer._id, limit: 5 },
      })) as TResponse<TOrder[]>;

      if (ordersResult?.success) {
        orders = ordersResult.data;
      }
    } catch (err) {
      console.log("Server fetch error:", err);
    }
  }

  return <CustomerDetails customer={customer} orders={orders} />;
}
