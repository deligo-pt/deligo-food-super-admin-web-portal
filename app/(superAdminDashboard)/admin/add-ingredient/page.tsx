import AddIngredients from "@/components/Dashboard/Ingradients/AddIngredient/AddIngredient";
import { getAllTaxesReq } from "@/services/dashboard/tax/tax.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};


export default async function AddIngredientsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const taxesResult = await getAllTaxesReq(queries);

  return <AddIngredients taxes={taxesResult?.data || []} />;
}
