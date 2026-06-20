import Ingredients from "@/components/Dashboard/Ingradients/Ingredients/Ingredients";
import { getAllIngredientsReq } from "@/services/dashboard/ingredient/ingredient.service";
import { getAllTaxesReq } from "@/services/dashboard/tax/tax.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllIngredientsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const ingredientsData = await getAllIngredientsReq(queries);
  const taxesResult = await getAllTaxesReq(queries);

  return <Ingredients ingredientsData={ingredientsData} taxes={taxesResult?.data} />;
}
