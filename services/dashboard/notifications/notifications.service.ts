/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TNotification } from "@/types/notification.type";
import { catchAsync } from "@/utils/catchAsync";

export const singleMarkReadReq = async (id: string) => {
  return catchAsync<TNotification[]>(async () => {
    return await serverRequest.patch(`/notifications/${id}/read`);
  });
};

export const allMarkReadReq = async () => {
  return catchAsync<TNotification[]>(async () => {
    return await serverRequest.patch("/notifications/mark-all-as-read");
  });
};


export const broadcastNotificationReq = async (payload : any) => {
  return catchAsync<TNotification>(async () => {
    return await serverRequest.post("/notifications/broadcast", {
      data: payload,
    });
  });
};