import DeliveryPartnersTitle from "@/components/AllDeliveryPartners/DeliveryPartnersTitle";
import DeliveryPartnerTable from "@/components/AllDeliveryPartners/DeliveryPartnerTable";

export default async function AllAgentsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Title */}
      <DeliveryPartnersTitle />

      {/* Delivery Partners Table */}
      <DeliveryPartnerTable />
    </div>
  );
}
