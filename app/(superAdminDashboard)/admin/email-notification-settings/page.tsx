import BroadcastCenter from "@/components/Dashboard/SystemManagement/BroadcastCenter/BroadcastCenter";
import { getAllUsersReq } from "@/services/dashboard/system-management/email-notification-settings.service";

const ROLES = [
  "VENDOR",
  "FLEET_MANAGER",
  "CUSTOMER",
  "DELIVERY_PARTNER",
  "ADMIN",
] as const;

export default async function EmailNotificationSettingsPage() {
  const results = await Promise.all(
    ROLES.map((role) => getAllUsersReq({ role, limit: 10, searchTerm: "" }))
  );

  const initialUsers = Object.fromEntries(
    ROLES.map((role, i) => [role, results[i]])
  );

  return <BroadcastCenter initialUsers={initialUsers} />;
}