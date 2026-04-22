import VendorReport from "@/components/Dashboard/Reports/VendorReport/VendorReport";
import { getVendorReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};
  const vendorReportAnalytics = await getVendorReportAnalytics({
    timeframe: "last7days",
    ...queries,
  });

  return <VendorReport vendorReportAnalytics={vendorReportAnalytics} />;
}
