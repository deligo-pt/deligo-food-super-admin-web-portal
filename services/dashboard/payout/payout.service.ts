"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TPayout } from "@/types/payout.type";
import { catchAsync } from "@/utils/catchAsync";

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
  const status = queries.status || "PAID";
  const userId = queries.userId;
  const userModel = (queries.userModel || "Vendor") as
    | "Vendor"
    | "FleetManager"
    | "DeliveryPartner";

  const params = {
    limit,
    page,
    sortBy,
    ...(status ? { status } : {}),
    ...(searchTerm ? { searchTerm } : {}),
    ...(userModel ? { userModel } : {}),
    ...(userId ? { userId } : {}),
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
