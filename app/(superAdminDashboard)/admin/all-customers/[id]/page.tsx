import { CustomerDetails } from "@/components/AllCustomers/CustomerDetails/CustomerDetails";
import { getSingleCustomerReq } from "@/services/dashboard/customer/customer.service";
import { getAllOrdersReq } from "@/services/dashboard/order/order.service";
import { TOrder } from "@/types/order.type";
import { TCustomer } from "@/types/user.type";

export default async function CustomersDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let orders: TOrder[] = [];

  const customer: TCustomer = await getSingleCustomerReq(id);

  if (customer?._id) {
    const ordersResult = await getAllOrdersReq({
      customerId: customer._id,
      limit: "5",
    });

    orders = ordersResult?.data || [];
  }

  return <CustomerDetails customer={customer} orders={orders} />;
}
