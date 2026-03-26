import { SOS } from "@/components/Dashboard/SOS/SOS";
import { getSOSStatReq } from "@/services/dashboard/SOS/sos.service";
import { cookies } from "next/headers";

export default async function SOSPage() {
  const accessToken = (await cookies()).get("accessToken")?.value || "";
  const SOSStats = await getSOSStatReq();

  return <SOS accessToken={accessToken} SOSStats={SOSStats} />;
}
