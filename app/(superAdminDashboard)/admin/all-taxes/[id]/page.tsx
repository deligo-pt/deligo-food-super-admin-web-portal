import TaxDetails from "@/components/Tax/TaxDetails/TaxDetails";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TTax } from "@/types/tax.type";

export default async function TaxDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TTax = {} as TTax;

  try {
    const result = (await serverRequest.get(`/taxes/${id}`)) as TResponse<TTax>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <TaxDetails tax={initialData} />;
}
