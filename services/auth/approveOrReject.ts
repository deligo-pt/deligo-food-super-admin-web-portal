"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const approveOrRejectReq = async (
  id: string,
  data: { status: "APPROVED" | "REJECTED" | "BLOCKED"; remarks: string },
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/auth/${id}/approved-rejected-user`, {
      data,
    });
  });
};
