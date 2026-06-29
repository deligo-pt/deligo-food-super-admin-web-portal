import TaxDetails from "@/components/Dashboard/Taxes/TaxDetails/TaxDetails";
import { getSingleTaxReq } from "@/services/dashboard/tax/tax.service";
import { TTax } from "@/types/tax.type";

interface IProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}

export default async function TaxDetailsPage({ params, searchParams }: IProps) {
  const { id } = await params;
  const { lang } = await searchParams;

  const tax: TTax = await getSingleTaxReq(id, lang as "en" | "pt");

  return <TaxDetails tax={tax} />;
}
