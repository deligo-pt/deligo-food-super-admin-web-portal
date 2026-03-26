import DeliveryPartnerReport from "@/components/Dashboard/Reports/DeliveryPartnerReport/DeliveryPartnerReport";
import { getAllDeliveryPartnersReq } from "@/services/dashboard/delivery-partner/delivery-partner.service";
import { getDeliverPartnerReportAnalytics } from "@/services/dashboard/reports/reports.service";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function DeliveryPartnerReportPage({
  searchParams,
}: IProps) {
  const queries = (await searchParams) || {};

  const deliveryPartnerReportAnalytics =
    await getDeliverPartnerReportAnalytics();
  const partnersData = await getAllDeliveryPartnersReq(queries);

  return (
    <DeliveryPartnerReport
      partnersData={partnersData}
      deliveryPartnerReportAnalytics={deliveryPartnerReportAnalytics}
    />
  );
}
