import { AgentOrVendorDetails } from "@/components/AgentOrVendorDetails/AgentOrVendorDetails";
import { cookies } from "next/headers";

export default async function page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const accessToken = (await cookies())?.get("accessToken")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/vendors/${id}`,
    { headers: { authorization: accessToken || "" } }
  );
  const result = await res.json();
  const data = result.data;

  return (
    <AgentOrVendorDetails fleetManager={data} backTo="/admin/all-vendors" />
  );
}
