import OutOfStockAlerts from "@/components/AllProducts/OutOfStockAlerts/OutOfStockAlerts";
import { getAllOutOfStocksReq } from "@/services/dashboard/product/out-of-stock.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function OutOfStockAlertsPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const productsData = await getAllOutOfStocksReq(queries);

  return <OutOfStockAlerts productsData={productsData} />;
}
