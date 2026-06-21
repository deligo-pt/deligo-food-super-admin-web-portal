import IngredientDetails from "@/components/Dashboard/Ingradients/Ingredients/IngredientDetails";
import { getSingleIngredientReq } from "@/services/dashboard/ingredient/ingredient.service";
import { getAllTaxesReq } from "@/services/dashboard/tax/tax.service";
import { TIngredient } from "@/types/ingredient.type"

type IProps = {
  params: Promise<{ sku: string }>;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function IngredientDetailsPage({ params, searchParams }: IProps) {
  const { sku } = await params;
  const queries = (await searchParams) || {};
  const ingredientData: TIngredient = await getSingleIngredientReq(sku);
  const taxesResult = await getAllTaxesReq(queries);

  return <IngredientDetails ingredientData={ingredientData} taxes={taxesResult?.data} />;
}
