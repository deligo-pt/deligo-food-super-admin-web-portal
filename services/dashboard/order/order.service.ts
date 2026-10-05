"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TOrder } from "@/types/order.type";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";
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

export const assignPartnerToOrder = async (orderId: string, data: any) => {
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

// ---------- Delivery Exception actions ----------

// get delivery exceptions
export const getDeliveryExceptions = async () => {
  const url = `/orders/delivery-exceptions`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["orders"],
      },
    });
    return await res.json();
  });

  return result;
};

export const acknowledgeExceptionReq = async (orderId: string) => {
  const url = `/orders/${orderId}/delivery-exception/acknowledge`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url);
    return await res.json();
  });


  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const resolveExceptionReq = async (
  orderId: string,
  body: { resolution: "RIDER_CONTINUES" | "FALSE_ALARM"; note?: string }
) => {
  const url = `/orders/${orderId}/delivery-exception/resolve`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const replacePartnerReq = async (
  orderId: string,
  body: { deliveryPartnerId: string; note?: string }
) => {
  const url = `/orders/${orderId}/replace-partner`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const faultCancelReq = async (
  orderId: string,
  body: { reason: string }
) => {
  const url = `/orders/${orderId}/fault-cancel`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const resetDeliveryOtpReq = async (orderId: string, body: { reason: string }) => {
  const url = `/orders/${orderId}/delivery-otp/reset`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.post(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const completeDeliveryReq = async (
  orderId: string,
  body: { reason: string }
) => {
  const url = `/orders/${orderId}/complete-delivery`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};

export const requestReceiptConfirmationReq = async (orderId: string) => {
  const url = `/orders/${orderId}/request-receipt-confirmation`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(url);
    return await res.json();
  });

  if (result?.success) {
    revalidateTag("orders", {});
    revalidatePath("/admin/delivery-exceptions");
  }

  return result;
};