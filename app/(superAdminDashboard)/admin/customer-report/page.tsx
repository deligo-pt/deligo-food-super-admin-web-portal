import { CustomerReport } from "@/components/Dashboard/Reports/CustomerReport/CustomerReport";
import { getAllCustomersReq } from "@/services/dashboard/customer/customer.service";
import { getCustomerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function CustomerReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};

  const customerReportAnalytics = await getCustomerReportAnalytics();
  const customersData = await getAllCustomersReq(queries);

  return (
    <CustomerReport
      customersData={customersData}
      customerReportAnalytics={customerReportAnalytics}
    />
  );
}
