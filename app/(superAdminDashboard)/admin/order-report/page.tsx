import OrderReport from "@/components/Dashboard/Reports/OrderReport/OrderReport";
import { getOrderReportAnalytics } from "@/services/dashboard/reports/reports.service";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const OrderReportPage = async ({ searchParams }: IProps) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const orderReportAnalytics = await getOrderReportAnalytics(queryString);

  return (
    <div>
      <OrderReport orderReportAnalytics={orderReportAnalytics} />
    </div>
  );
};

export default OrderReportPage;
