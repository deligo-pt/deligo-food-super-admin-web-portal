import Customers from "@/components/Dashboard/Customers/Customers";
import { getAllCustomersReq } from "@/services/dashboard/customer/customer.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllCustomersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const customersResult = await getAllCustomersReq(queries);

  return (
    <Customers
      customersResult={customersResult}
      showFilters={true}
      title="All Customers"
      subtitle="Manage all registered customers"
    />
  );
}
