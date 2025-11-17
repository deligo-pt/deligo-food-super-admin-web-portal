import { AgentDetails } from "@/components/AllAgents/AgentDetails";
import { cookies } from "next/headers";

export default async function VendorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const accessToken = (await cookies())?.get("accessToken")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/fleet-managers/${id}`,
    { headers: { authorization: accessToken || "" } }
  );
  const result = await res.json();
  const data = result.data;

  return <AgentDetails agent={data} />;
}
