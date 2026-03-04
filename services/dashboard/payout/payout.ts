"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TPayout } from "@/types/payout.type";
import { catchAsync } from "@/utils/catchAsync";

export const initializePayoutReq = async (data: { targetUserId: string }) => {
  return catchAsync<TPayout>(async () => {
    return await serverRequest.post("/payouts/initiate-settlement", { data });
  });
};

export const rejectPayoutReq = async (
  payoutId: string,
  data: { reason: string },
) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post(`/payouts/reject-payout/${payoutId}`, {
      data,
    });
  });
};

export const retryFailedPayoutReq = async (payoutId: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post(`/payouts/retry-failed-payout/${payoutId}`);
  });
};
