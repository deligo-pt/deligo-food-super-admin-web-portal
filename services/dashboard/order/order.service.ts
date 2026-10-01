"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TOrder } from "@/types/order.type";
import { catchAsync } from "@/utils/catchAsync";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export const getAllOrdersReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const orderStatus = queries.orderStatus || "";
  const paymentStatus = queries.paymentStatus || "";
  const customerId = queries.customerId || "";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(orderStatus ? { orderStatus } : {}),
    ...(paymentStatus ? { paymentStatus } : {}),
    ...(customerId ? { customerId } : {}),
  };

  const result = await catchAsync<TOrder[]>(async () => {
    return await serverRequest.get("/orders", {
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

export const getSingleOrderReq = async (id: string) => {
  const result = await catchAsync<TOrder>(async () => {
    return await serverRequest.get(`/orders/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllOrders = async () => {
  try {
    const res = await serverFetch.get(`/orders`, {
      next: {
        revalidate: 30,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch orders");
    }

    const result = await res.json();

    return result;
  } catch (error: any) {
    if (isRedirectError(error)) {
      throw error;
    }
    console.log(error);
    return {
      success: false,
      message: `${process.env.NODE_ENV === "development" ? error?.message : "Something went wrong in orders fetching."}`,
    };
  }
};

export const getNearbyPartnersForOrders = async (orderId: string) => {
  const url = `/orders/${orderId}/nearby-partners`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["partners"],
      },
    });
    return await res.json();
  });

  return result;
};

export const assignPartnerToOrder = async (orderId: string, data : any) => {
  const url = `/orders/${orderId}/assign-partner`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  });

  return result;
};

// refund order
export const refundOrderReq = async (id: string) => {
  const result = await catchAsync<TOrder>(async () => {
    return await serverRequest.post(`/payment/reduniq/refund/${id}`);
  });

  return result;
};
