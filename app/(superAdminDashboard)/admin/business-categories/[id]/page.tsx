import BusinessCategoryDetails from "@/components/AllBusinessCategories/BusinessCategoryDetails";
import { cookies } from "next/headers";

export default async function BusinessCategoryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = (await cookies()).get("accessToken")?.value || "";

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/businessCategory/${id}`,
    { headers: { authorization: accessToken } }
  );
  const result = await response.json();
  const data = result.data;

  return <BusinessCategoryDetails category={data} />;
}
