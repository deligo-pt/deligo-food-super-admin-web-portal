import RewardsSettings from "@/components/Dashboard/Settings/RewardsSettings/RewardsSettings";
import { getGlobalSettingsReq } from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";

export default async function RewardsSettingsPage() {
  const settingsResult: TGlobalSettings = await getGlobalSettingsReq();

  return <RewardsSettings settingsResult={settingsResult} />;
}
