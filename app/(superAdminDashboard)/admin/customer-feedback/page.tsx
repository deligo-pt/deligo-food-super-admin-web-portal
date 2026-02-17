import CustomerFeedback from "@/components/Dashboard/Ratings/CustomerFeedback/CustomerFeedback";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta, TResponse } from "@/types";
import { TRating } from "@/types/rating.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerFeedbackPage({ searchParams }: IProps) {
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

  const initialData: { data: TRating[]; meta?: TMeta } = { data: [] };

  try {
    const result = (await serverRequest.get("/ratings/get-all-ratings", {
      params: query,
    })) as TResponse<TRating[]>;

    if (result?.success) {
      initialData.data = result.data;
      initialData.meta = result.meta;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <CustomerFeedback feedbackResult={initialData} />;
}
