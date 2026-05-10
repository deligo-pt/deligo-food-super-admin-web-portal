import PayoutSettings from "@/components/Dashboard/Settings/PayoutSettings/PayoutSettings";
import { getGlobalSettingsReq } from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";

export default async function RewardsSettingsPage() {
  const settingsResult: TGlobalSettings = await getGlobalSettingsReq();

  return <PayoutSettings settingsResult={settingsResult} />;
}
