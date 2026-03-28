import VendorReport from "@/components/Dashboard/Reports/VendorReport/VendorReport";
import { getVendorReportAnalytics } from "@/services/dashboard/reports/reports.service";

export default async function VendorReportPage() {
  const vendorReportAnalytics = await getVendorReportAnalytics();

  return <VendorReport vendorReportAnalytics={vendorReportAnalytics} />;
}
