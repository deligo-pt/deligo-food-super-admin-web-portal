"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TSupportMessage, TSupportTicket } from "@/types/support.type";
import { catchAsync } from "@/utils/catchAsync";

export const getAllTicketsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  //   const searchTerm = queries.searchTerm || "";
  //   const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const params = {
    limit,
    page,
    // sortBy,
    ...(status ? { status } : {}),
  };

  const result = await catchAsync<TSupportTicket[]>(async () => {
    return await serverRequest.get("/support/tickets", {
      params,
    });
  });

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
    meta: {} as TMeta,
  };
};

export const getMessagesReq = async (
  ticketId: string,
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  //   const searchTerm = queries.searchTerm || "";
  //   const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const params = {
    limit,
    page,
    // sortBy,
    ...(status ? { status } : {}),
  };

  const result = await catchAsync<TSupportMessage[]>(async () => {
    return await serverRequest.get(`/support/tickets/${ticketId}/messages`, {
      params,
    });
  });

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};

export const markReadReq = async (ticketId: string) => {
  return catchAsync<number>(async () => {
    return await serverRequest.patch(`/support/tickets/${ticketId}/read`);
  });
};

export const closeTicketReq = async (ticketId: string) => {
  return catchAsync<number>(async () => {
    return await serverRequest.patch(`/support/tickets/${ticketId}/close`);
  });
};

export const getUnreadCountReq = async () => {
  return catchAsync<number>(async () => {
    return await serverRequest.get("/support/unread-count");
  });
};

export const getMessagesByRoom = async (room: string) => {
  const result = await catchAsync<number>(async () => {
    return await serverRequest.get(`/support/conversations/${room}/messages`, {
      params: { limit: 50, sortBy: "-createdAt" },
    });
  });

  if (result.success)
    return {
      data: (result?.data || [])?.reverse(),
      meta: result.meta,
    };

  return {
    data: [],
  };
};
