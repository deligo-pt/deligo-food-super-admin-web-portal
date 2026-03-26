import Profile from "@/components/Profile/Profile";
import { getProfileReq } from "@/services/dashboard/profile/profile.service";
import { TAdmin } from "@/types/admin.type";

export default async function ProfilePage() {
  const adminData: TAdmin = await getProfileReq();

  return <Profile admin={adminData} />;
}
