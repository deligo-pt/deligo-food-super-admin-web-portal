import { TUserModel } from "@/types/support.type";
import {
  BikeIcon,
  BriefcaseIcon,
  ShieldUserIcon,
  StoreIcon,
  UserIcon,
} from "lucide-react";

export default function SupportRoleBadge({ role }: { role: TUserModel }) {
  const styles = {
    Vendor: "bg-purple-100 text-purple-700",
    DeliveryPartner: "bg-blue-100 text-blue-700",
    FleetManager: "bg-emerald-100 text-emerald-700",
    Customer: "bg-rose-100 text-rose-700",
    Admin: "bg-gray-100 text-gray-700",
  };

  const icons = {
    Vendor: <StoreIcon size={12} />,
    DeliveryPartner: <BikeIcon size={12} />,
    FleetManager: <BriefcaseIcon size={12} />,
    Customer: <UserIcon size={12} />,
    Admin: <ShieldUserIcon size={12} />,
  };

  const roles = {
    Vendor: "Vendor",
    DeliveryPartner: "Delivery Partner",
    FleetManager: "Fleet Manager",
    Customer: "Customer",
    Admin: "Admin",
  };

  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${styles[role] ?? "bg-gray-100 text-gray-600"}`}
    >
      {icons[role] ?? null}
      {roles[role] ?? role}
    </span>
  );
}
