import IngredientDetails from "@/components/Dashboard/Ingradients/Ingredients/IngredientDetails";
import { TIngredient } from "@/types/ingredient.type";

export default async function IngredientDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TIngredient = {} as TIngredient;

  // try {
  //   const result = (await serverRequest.get(
  //     `/ingredients/${id}`,
  //   )) as TResponse<TIngredient>;

  //   if (result?.success) {
  //     initialData = result.data;
  //   }
  // } catch (err) {
  //   console.log("Server fetch error:", err);
  // }

  const initialIngredient: TIngredient = {
    _id: "ING-001",
    ingredientId: "ING-001",
    name: "Large Pizza Box",
    category: "Box",
    price: 0.5,
    stock: 5000,
    minOrder: 50,
    description:
      "Standard 12-inch pizza box, corrugated cardboard. Eco-friendly and recyclable material. Perfect for hot pizza delivery.",
    image: "https://vendor-food.deligo.pt/deligoLogo.png",
    createdAt: "2026-01-03T12:00:00Z",
    updatedAt: "2026-01-05T12:00:00Z",
  };

  initialData = initialIngredient;

  if (!id) console.log("no id");

  return <IngredientDetails ingredientData={initialData} />;
}
