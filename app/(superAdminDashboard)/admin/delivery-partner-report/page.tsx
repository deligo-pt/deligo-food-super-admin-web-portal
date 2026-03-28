import DeliveryPartnerReport from "@/components/Dashboard/Reports/DeliveryPartnerReport/DeliveryPartnerReport";
import { getDeliverPartnerReportAnalytics } from "@/services/dashboard/reports/reports.service";

export default async function DeliveryPartnerReportPage() {
  const deliveryPartnerReportAnalytics =
    await getDeliverPartnerReportAnalytics();

  return (
    <DeliveryPartnerReport
      deliveryPartnerReportAnalytics={deliveryPartnerReportAnalytics}
    />
  );
}
