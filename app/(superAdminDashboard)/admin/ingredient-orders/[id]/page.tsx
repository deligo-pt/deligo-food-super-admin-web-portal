import IngredientOrderDetails from "@/components/Dashboard/Ingradients/IngredientOrders/IngredientOrderDetails";
import { TIngredientOrder } from "@/types/ingredient.type";

export default async function IngredientOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let initialData: TIngredientOrder = {} as TIngredientOrder;

  // try {
  //   const result = (await serverRequest.get(
  //     `/ingredient-orders/${id}`,
  //   )) as TResponse<TIngredientOrder>;

  //   if (result?.success) {
  //     initialData = result.data;
  //   }
  // } catch (err) {
  //   console.log("Server fetch error:", err);
  // }

  const initialOrder: TIngredientOrder = {
    _id: "ORD-001",
    orderId: "ORD-001",
    vendor: {
      name: {},
      businessDetails: {
        businessName: "ABC Food Delivery",
        businessType: "RESTAURANT",
        totalBranches: 5,
      },
      email: "X2U2F@example.com",
      contactNumber: "+1234567890",
      businessLocation: {
        street: "123 Main St",
        postalCode: "12345",
        city: "New York",
        state: "NY",
        country: "USA",
      },
    },
    status: "PENDING",
    ingredients: [
      {
        _id: "1",
        name: "Large Pizza Box",
        quantity: 100,
        price: 0.5,
      },
      {
        _id: "2",
        name: "Mini Burger Box",
        quantity: 20,
        price: 1.2,
      },
      {
        _id: "3",
        name: "Plastic Cutlery Set",
        quantity: 50,
        price: 0.25,
      },
    ],
    totalPrice: 86.5,
    timeline: [
      {
        status: "Order Placed",
        date: "2026-01-15 14:30",
        completed: true,
      },
      {
        status: "Processing",
        date: "Pending",
        completed: false,
      },
      {
        status: "Shipped",
        date: "Pending",
        completed: false,
      },
      {
        status: "Delivered",
        date: "Pending",
        completed: false,
      },
    ],

    createdAt: "2026-01-15 14:30",
    updatedAt: "2026-01-15 14:30",
  };
  initialData = initialOrder;

  if (!id) console.log("no id");

  return <IngredientOrderDetails order={initialData} />;
}
