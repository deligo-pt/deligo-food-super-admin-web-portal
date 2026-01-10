import { GlobalSettings } from "@/components/GlobalSettings/GlobalSettings";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TGlobalSettings } from "@/types/global-settings.type";

export default async function GlobalSettingsPage() {
  let initialData: TGlobalSettings = {} as TGlobalSettings;

  try {
    const result = (await serverRequest.get(
      "/globalSettings"
    )) as TResponse<TGlobalSettings>;

    if (result?.success) {
      initialData = result.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <GlobalSettings settingsResult={initialData} />;
}
