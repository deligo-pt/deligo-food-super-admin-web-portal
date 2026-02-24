import SalesReport from '@/components/Dashboard/Reports/SalesReport/SalesReport';
import { getSalesReportAnalytics } from '@/services/dashboard/reports/reports.service';
import { queryStringFormatter } from '@/utils/formatter';


interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const SalesReportPage = async ({ searchParams }: IProps) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const salesReportAnalytics = await getSalesReportAnalytics(queryString);
  console.log("salesReportAnalytics", salesReportAnalytics)
  return (
    <div>
      <SalesReport salesReportAnalytics={salesReportAnalytics} />
    </div>
  );
};

export default SalesReportPage;