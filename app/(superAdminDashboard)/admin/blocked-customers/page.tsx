import Customers from "@/components/Dashboard/Customers/Customers";
import { getAllCustomersReq } from "@/services/dashboard/customer/customer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function BlockedCustomersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const customersResult = await getAllCustomersReq({
    ...queries,
    status: "BLOCKED",
  });

  return (
    <Customers
      customersResult={customersResult}
      title="Active Customers"
      subtitle="All active customers in the system"
    />
  );
}
