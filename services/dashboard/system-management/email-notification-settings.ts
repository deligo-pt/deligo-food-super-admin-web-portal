"use server";

import { USER_ROLE } from "@/consts/user.const";
import { serverRequest } from "@/lib/serverFetch";
import { catchAsync } from "@/utils/catchAsync";

export const getAllUsersReq = async ({
  limit = 10,
  searchTerm = "",
  role,
}: {
  limit: number;
  searchTerm: string;
  role: keyof typeof USER_ROLE;
}) => {
  let endpoint: string = "";

  switch (role) {
    case "VENDOR":
      endpoint = "/vendors";
      break;
    case "DELIVERY_PARTNER":
      endpoint = "/delivery-partners";
      break;
    case "FLEET_MANAGER":
      endpoint = "/fleet-managers";
      break;
    case "CUSTOMER":
      endpoint = "/customers";
      break;
    case "ADMIN":
      endpoint = "/admins";
      break;
  }

  const result = await catchAsync<unknown>(async () => {
    return await serverRequest.get(endpoint, {
      params: { limit, ...(searchTerm ? { searchTerm } : {}) },
    });
  });

  if (result.success) {
    return { data: result.data, meta: result.meta };
  }

  return { data: [] };
};
