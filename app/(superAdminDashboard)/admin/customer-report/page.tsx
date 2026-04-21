import { CustomerReport } from "@/components/Dashboard/Reports/CustomerReport/CustomerReport";
import { getCustomerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const customerReportAnalytics = await getCustomerReportAnalytics({
    timeframe: "last7days",
    ...queries,
  });

  return <CustomerReport customerReportAnalytics={customerReportAnalytics} />;
}
