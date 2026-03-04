import OrderReport from "@/components/Dashboard/Reports/OrderReport/OrderReport";
import { getAllOrders } from "@/services/dashboard/order/order.service";
import { getOrderReportAnalytics } from "@/services/dashboard/reports/reports.service";
import { queryStringFormatter } from "@/utils/formatter";

interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const OrderReportPage = async ({ searchParams }: IProps) => {
  const orders = await getAllOrders();
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const orderReportAnalytics = await getOrderReportAnalytics(queryString);

  return (
    <div>
      <OrderReport orderReportAnalytics={orderReportAnalytics} ordersData={orders} />
    </div>
  );
};

export default OrderReportPage;