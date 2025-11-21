"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";

export const approveOrRejectReq = async (
  id: string,
  data: { status: string; remarks: string }
) => {
  const result = (await serverRequest.patch(
    `/auth/${id}/approved-rejected-user`,
    { data }
  )) as TResponse<null>;

  return result;
};
