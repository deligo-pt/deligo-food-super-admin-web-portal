import Ingredients from "@/components/Dashboard/Ingradients/Ingredients/Ingredients";
import { TMeta } from "@/types";
import { TIngredient } from "@/types/ingredient.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function AllIngredientsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";

  const query = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
  };

  const initialData: { data: TIngredient[]; meta?: TMeta } = { data: [] };

  // try {
  //   const result = (await serverRequest.get("/ingredients", {
  //     params: query,
  //   })) as TResponse<TIngredient[]>;

  //   if (result?.success) {
  //     initialData.data = result.data;
  //     initialData.meta = result.meta;
  //   }
  // } catch (err) {
  //   console.log("Server fetch error:", err);
  // }

  const initialIngredients: TIngredient[] = [
    {
      _id: "1",
      ingredientId: "ING-001",
      name: "Large Pizza Box",
      category: "Box",
      price: 0.5,
      stock: 5000,
      image: "/deligoLogo.png",
      createdAt: "2026-01-15T00:00:00.000Z",
      updatedAt: "2026-01-16T00:00:00.000Z",
    },
    {
      _id: "2",
      ingredientId: "ING-002",
      name: "Paper Bag (Medium)",
      category: "Bag",
      price: 0.15,
      stock: 12000,
      image: "/deligoLogo.png",
      createdAt: "2026-01-12T00:00:00.000Z",
      updatedAt: "2026-01-12T00:00:00.000Z",
    },
    {
      _id: "3",
      ingredientId: "ING-003",
      name: "Plastic Cutlery Set",
      category: "Cutlery",
      price: 0.25,
      stock: 8000,
      image: "/deligoLogo.png",
      createdAt: "2026-01-10T00:00:00.000Z",
      updatedAt: "2026-01-10T00:00:00.000Z",
    },
    {
      _id: "4",
      ingredientId: "ING-004",
      name: "Burger Box",
      category: "Box",
      price: 0.3,
      stock: 4500,
      image: "/deligoLogo.png",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
  ];

  initialData.data = initialIngredients;
  initialData.meta = { total: 4, totalPage: 1, page: 1, limit: 10 };

  if (!!query) console.log("no query");

  return <Ingredients ingredientsData={initialData} />;
}
