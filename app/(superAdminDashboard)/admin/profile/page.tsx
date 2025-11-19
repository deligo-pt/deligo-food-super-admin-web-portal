import Profile from "@/components/Profile/Profile";
import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";
import { jwtDecode } from "jwt-decode";
import { cookies } from "next/headers";

export default async function ProfilePage() {
  const accessToken = (await cookies()).get("accessToken")?.value || "";
  const decoded = jwtDecode(accessToken) as { id: string };

  let adminData: TAdmin = {} as TAdmin;

  try {
    const result = await serverRequest.get(`/admins/${decoded.id}`);

    if (result?.success) {
      adminData = result?.data;
    }
  } catch (err) {
    console.error("Server fetch error:", err);
  }

  return <Profile admin={adminData} />;
}
