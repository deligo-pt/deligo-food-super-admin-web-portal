import IngredientOrders from "@/components/Dashboard/Ingradients/IngredientOrders/IngredientOrders";
import { getAllIngredientOrdersReq } from "@/services/dashboard/ingredient/ingredient.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function IngredientOrdersPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const ingredientOrdersData = await getAllIngredientOrdersReq(queries);

  return <IngredientOrders ingredientOrdersData={ingredientOrdersData} />;
}
