import Taxes from "@/components/Dashboard/Taxes/Taxes/Taxes";
import { getAllTaxesReq } from "@/services/dashboard/tax/tax.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllTaxesPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const taxesResult = await getAllTaxesReq(queries);

  return <Taxes taxesResult={taxesResult} />;
}
