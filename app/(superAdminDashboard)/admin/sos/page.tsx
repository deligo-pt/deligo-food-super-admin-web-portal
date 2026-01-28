import { SOS } from "@/components/Dashboard/SOS/SOS";
import { getSOSStatReq } from "@/services/dashboard/SOS/SOS";
import { TSOSStats } from "@/types/sos.type";
import { cookies } from "next/headers";

export default async function SOSPage() {
  const accessToken = (await cookies()).get("accessToken")?.value || "";

  let initialData: TSOSStats = {} as TSOSStats;

  const result = await getSOSStatReq();

  if (result?.success) {
    initialData = result.data;
  } else {
    console.log("Server fetch error:", result);
  }

  return <SOS accessToken={accessToken} SOSStats={initialData} />;
}
