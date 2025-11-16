import { TDeliveryPartner } from "@/types/delivery-partner.type";

export default function StatusBadge({
  status,
}: {
  status: TDeliveryPartner["status"];
}) {
  const statusStyles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    BLOCKED: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  );
}
