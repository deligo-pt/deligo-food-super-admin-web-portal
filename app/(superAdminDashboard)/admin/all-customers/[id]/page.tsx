import { CustomerDetails } from "@/components/AllCustomers/CustomerDetails/CustomerDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TCustomer } from "@/types/user.type";

export default async function CustomersDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let initialData: TCustomer = {} as TCustomer;

  try {
    const result = (await serverRequest.get(
      `/customers/${id}`,
    )) as unknown as TResponse<TCustomer>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <CustomerDetails customer={initialData} />;
}
