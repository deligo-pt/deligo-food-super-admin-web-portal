import GlobalSettings from "@/components/Dashboard/Settings/GlobalSettings/GlobalSettings";
import { getGlobalSettingsReq } from "@/services/dashboard/global-settings/global-settings.service";
import { getAllTaxesReq } from "@/services/dashboard/tax/tax.service";
import { TGlobalSettings } from "@/types/global-settings.type";

type IProps = {
  searchParams?: Promise<Record<string, string | undefined>>;
};

export default async function GlobalSettingsPage({ searchParams }: IProps) {
  const settingsResult: TGlobalSettings = await getGlobalSettingsReq();
  const queries = (await searchParams) || {};
  const taxesResult = await getAllTaxesReq(queries);

  return <GlobalSettings settingsResult={settingsResult} taxRates={taxesResult?.data} />;
}
