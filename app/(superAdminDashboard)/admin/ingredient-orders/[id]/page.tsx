import IngredientOrderDetails from "@/components/Dashboard/Ingradients/IngredientOrders/IngredientOrderDetails";
import { getSingleIngredientOrderReq } from "@/services/dashboard/ingredient/ingredient.service";

export default async function IngredientOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getSingleIngredientOrderReq(id);

  return <IngredientOrderDetails order={order} />;
}
