import Dashboard from "@/components/Dashboard/Dashboard";
import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TVendor } from "@/types/user.type";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export default async function DashboardPage() {
  let initialData = "";

  try {
    const accessToken = (await cookies()).get("accessToken")?.value || "";
    const decoded = jwtDecode(accessToken) as { id: string };
    const id = decoded.id;
    const result = (await serverRequest.get(
      `/vendors/${id}`
    )) as unknown as TResponse<TVendor>;

    if (result?.success) {
      initialData = `${result?.data?.name?.firstName} ${result?.data?.name?.lastName}`;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <Dashboard vendorName={initialData} />;
}
