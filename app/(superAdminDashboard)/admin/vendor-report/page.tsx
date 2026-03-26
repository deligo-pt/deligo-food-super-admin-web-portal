import VendorReport from "@/components/Dashboard/Reports/VendorReport/VendorReport";
import { getVendorReportAnalytics } from "@/services/dashboard/reports/reports.service";
import { getAllVendorsReq } from "@/services/dashboard/vendor/vendor.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function VendorReportPage({ searchParams }: IProps) {
  const queries = (await searchParams) || {};

  const vendorReportAnalytics = await getVendorReportAnalytics();
  const vendorsData = await getAllVendorsReq(queries);

  return (
    <VendorReport
      vendorsData={vendorsData}
      vendorReportAnalytics={vendorReportAnalytics}
    />
  );
}
