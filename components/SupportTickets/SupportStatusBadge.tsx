import { TTicketStatus } from "@/types/support.type";
import { removeUnderscore } from "@/utils/formatter";

export default function SupportStatusBadge({
  status,
}: {
  status: TTicketStatus;
}) {
  const styles = {
    OPEN: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    CLOSED: "bg-[#DC3173]/10 text-[#DC3173]",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status]}`}
    >
      {removeUnderscore(status)}
    </span>
  );
}
