import Customers from "@/components/Dashboard/Customers/Customers";
import { getAllCustomersReq } from "@/services/dashboard/customer/customer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function ActiveCustomersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const customersResult = await getAllCustomersReq({
    ...queries,
    status: "APPROVED",
  });

  return (
    <Customers
      customersResult={customersResult}
      title="active_customers"
      subtitle="all_active_customers_in_system"
    />
  );
}
