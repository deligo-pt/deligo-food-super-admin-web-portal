import IngredientDetails from "@/components/Dashboard/Ingradients/Ingredients/IngredientDetails";
import { getSingleIngredientReq } from "@/services/dashboard/ingredient/ingredient.service";
import { TIngredient } from "@/types/ingredient.type";

export default async function IngredientDetailsPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = await params;
  const ingredientData: TIngredient = await getSingleIngredientReq(sku);

  return <IngredientDetails ingredientData={ingredientData} />;
}
