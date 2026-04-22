import DeliveryPartnerReport from "@/components/Dashboard/Reports/DeliveryPartnerReport/DeliveryPartnerReport";
import { getDeliverPartnerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerReportPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};
  const deliveryPartnerReportAnalytics = await getDeliverPartnerReportAnalytics(
    {
      timeframe: "last7days",
      ...queries,
    },
  );

  return (
    <DeliveryPartnerReport
      deliveryPartnerReportAnalytics={deliveryPartnerReportAnalytics}
    />
  );
}
