import { CustomerReport } from "@/components/Dashboard/Reports/CustomerReport/CustomerReport";
import { getCustomerReportAnalytics } from "@/services/dashboard/reports/reports.service";

export default async function CustomerReportPage() {
  const customerReportAnalytics = await getCustomerReportAnalytics();

  return <CustomerReport customerReportAnalytics={customerReportAnalytics} />;
}
