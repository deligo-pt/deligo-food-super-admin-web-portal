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

export const getSinglePayoutReq = async (id: string) => {
  const result = await catchAsync<TPayout>(async () => {
    return await serverRequest.get(`/payouts/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllPayoutsReq = async <T>(
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const userModel = (queries.sortBy || "Vendor") as
    | "Vendor"
    | "FleetManager"
    | "DeliveryPartner";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(userModel ? { userModel } : {}),
  };

  const result = await catchAsync<T>(async () => {
    return await serverRequest.get("/payouts", {
      params,
    });
  });

  return {
    data: result.data,
    meta: result.meta,
  };
};
