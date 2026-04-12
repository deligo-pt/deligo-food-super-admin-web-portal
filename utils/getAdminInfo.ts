import { serverRequest } from "@/lib/serverFetch";
import { TAdmin } from "@/types/admin.type";
import { catchAsync } from "@/utils/catchAsync";
import { verifyJWT } from "@/utils/verifyJWT";
import { cookies } from "next/headers";

export const getAdminInfo = async (): Promise<{
  admin: TAdmin;
  accessToken: string;
} | null> => {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value || "";

  if (accessToken) {
    const decoded = await verifyJWT(accessToken);

    if (
      decoded.success &&
      (decoded?.data?.role === "ADMIN" || decoded?.data?.role === "SUPER_ADMIN")
    ) {
      const result = await catchAsync<TAdmin>(async () => {
        return await serverRequest.get(`/admins/${decoded?.data?.userId}`);
      });

      if (result?.success) {
        if (result?.data?.status === "APPROVED") {
          return { admin: result?.data, accessToken };
        }
        return null;
      }
      return null;
    }
    return null;
  }

  return null;
};
