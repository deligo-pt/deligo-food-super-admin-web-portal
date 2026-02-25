import { TVendor } from "@/types/user.type";

export type TIngredient = {
  _id: string;
  ingredientId: string;

  name: string;
  category: string;

  price: number;
  stock: number;

  image: string;

  createdAt: string;
  updatedAt: string;
};

export type TIngredientOrder = {
  _id: string;
  orderId: string;

  vendor: Partial<TVendor>;
  ingredients: (Partial<TIngredient> & { quantity: number })[];
  totalPrice: number;

  status: "PENDING" | "APPROVED" | "REJECTED" | "DELIVERED" | "CANCELLED";

  createdAt: string;
  updatedAt: string;
};
