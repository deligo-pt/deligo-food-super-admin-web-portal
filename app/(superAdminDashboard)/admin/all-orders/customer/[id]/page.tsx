import Orders from "@/components/Dashboard/Orders/Orders";
import { getSingleCustomerReq } from "@/services/dashboard/customer/customer.service";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";
import { TMeta } from "@/types";
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

  const customer: TCustomer = await getSingleCustomerReq(id);
  let ordersResult: { data: TOrder[]; meta?: TMeta } = { data: [] };

  if (customer?._id) {
    const queries = (await searchParams) || {};
    ordersResult = await getAllOrdersReq({
      ...queries,
      customerId: customer._id,
    });
  }

  return (
    <Orders
      ordersResult={ordersResult}
      title={
        customer.name?.firstName || customer.name?.lastName
          ? `Orders from ${customer?.name?.firstName} ${customer?.name?.lastName}`
          : "Customer Orders"
      }
      subtitle="Manage customer orders here"
    />
  );
}
