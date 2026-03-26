import { GlobalSettings } from "@/components/GlobalSettings/GlobalSettings";
import { getGlobalSettingsReq } from "@/services/dashboard/global-settings/global-settings.service";
import { TGlobalSettings } from "@/types/global-settings.type";

export default async function GlobalSettingsPage() {
  const settingsResult: TGlobalSettings = await getGlobalSettingsReq();

  return <GlobalSettings settingsResult={settingsResult} />;
}
