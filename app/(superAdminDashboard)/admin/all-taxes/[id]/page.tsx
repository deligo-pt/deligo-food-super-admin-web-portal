import TaxDetails from "@/components/Tax/TaxDetails/TaxDetails";
import { getSingleTaxReq } from "@/services/dashboard/tax/tax.service";
import { TTax } from "@/types/tax.type";

export default async function TaxDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tax: TTax = await getSingleTaxReq(id);

  return <TaxDetails tax={tax} />;
}
