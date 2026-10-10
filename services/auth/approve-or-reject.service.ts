"use server";

import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const approveOrRejectReq = async (
  id: string,
  data: { status: "APPROVED" | "REJECTED" | "BLOCKED"; remarks?: string },
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/auth/${id}/approved-rejected-user`, {
      data,
    });
  });
};

export const blockUnblockUser = async (
  id: string,
  data: { expectedAction: "UNBLOCK" | "BLOCK"; remarks?: string, restoreTo?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' },
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/auth/${id}/block-status`, {
      data,
    });
  });
};
