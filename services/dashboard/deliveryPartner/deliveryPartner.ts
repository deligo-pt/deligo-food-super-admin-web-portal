"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";

export const deleteDeliveryPartner = async (id: string) => {
  const result = (await serverRequest.delete(
    `/auth/soft-delete/${id}`
  )) as TResponse<null>;

  return result;
};
