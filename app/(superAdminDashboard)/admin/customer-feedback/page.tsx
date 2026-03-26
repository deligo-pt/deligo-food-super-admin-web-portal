import CustomerFeedback from "@/components/Dashboard/Ratings/CustomerFeedback/CustomerFeedback";
import { getAllRatingsReq } from "@/services/dashboard/rating/rating.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerFeedbackPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const feedbackResult = await getAllRatingsReq(queries);

  return <CustomerFeedback feedbackResult={feedbackResult} />;
}
