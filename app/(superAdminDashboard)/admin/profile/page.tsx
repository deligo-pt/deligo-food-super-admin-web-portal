import Profile from "@/components/Profile/Profile";
import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";

export default async function ProfilePage() {
  let adminData: TAdmin = {} as TAdmin;

  try {
    const result = await serverRequest.get("/profile");

    if (result?.success) {
      adminData = result?.data;
    }
  } catch (err) {
    console.log("Server fetch error:", err);
  }

  return <Profile admin={adminData} />;
}
