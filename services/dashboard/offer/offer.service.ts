"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TOffer, TOfferAnalytics } from "@/types/offer.type";
import { catchAsync } from "@/utils/catchAsync";
import { twoForOneOfferPayload, twoForOneState, type TTwoForOneState } from "@/utils/twoForOne";

export const createOfferReq = async (data: Partial<TOffer>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/offers/create-offer", {
      data,
    });
  });
};

export const createVendorOffer = async (data: Partial<TOffer>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.post("/offers/admin/create-vendor-offer", {
      data,
    });
  });
};

export const updateOfferReq = async (id: string, data: Partial<TOffer>) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/offers/${id}`, {
      data,
    });
  });
};

export const toggleOfferStatusReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.patch(`/offers/toggle-status/${id}`);
  });
};

export const deleteOfferReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/offers/soft-delete/${id}`);
  });
};

export const getSingleOfferReq = async (id: string) => {
  const result = await catchAsync<TOffer>(async () => {
    return await serverRequest.get(`/offers/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllOffersReq = async (
  queries: Record<string, string | undefined>,
): Promise<{ data: TOffer[]; meta?: TMeta }> => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const vendorId = queries.vendorId;
  const activeStatus = queries.activeStatus;
  const validStatus = queries.validStatus;

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm } : {}),
    ...(vendorId ? { vendorId } : {}),
    ...(activeStatus ? { isActive: activeStatus === "ACTIVE" } : {}),
    ...(validStatus ? { isExpired: validStatus !== "VALID" } : {}),
    isDeleted: false,
  };

  const result = await catchAsync<TOffer[]>(async () => {
    return await serverRequest.get("/offers", {
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

export const getOfferAnalyticsReq = async () => {
  const result = await catchAsync<TOfferAnalytics>(async () => {
    return await serverRequest.get("/analytics/offer-analytics");
  });

  if (result?.success) return result.data;

  return {};
};

/* ----- 2×1 on a product (sheet row 77, plan.md §10.5) ----- */

/**
 * The product's 2×1 state among its vendor's offers (`vendorMongoId` and
 * `productMongoId` are `_id`s). Null when the offers can't be read — the
 * switch then stays disabled rather than guessing.
 */
export const getTwoForOneStateReq = async (
  vendorMongoId: string,
  productMongoId: string,
): Promise<TTwoForOneState | null> => {
  const offers: TOffer[] = [];
  for (let page = 1; page <= 20; page++) {
    const res = await catchAsync<TOffer[]>(async () =>
      serverRequest.get("/offers", { params: { vendorId: vendorMongoId, limit: 100, page, isDeleted: false } }),
    );
    if (!res.success || !Array.isArray(res.data)) return null;
    offers.push(...res.data);
    const totalPage = Number(res.meta?.totalPage ?? 1);
    if (page >= totalPage) break;
  }
  return twoForOneState(offers, productMongoId);
};

/** Creates the product's buy-1-get-1-free offer for its vendor. */
export const createTwoForOneReq = async (
  vendorMongoId: string,
  productMongoId: string,
  name: { en: string; pt: string },
) => {
  return catchAsync<TOffer>(async () =>
    serverRequest.post("/offers/admin/create-vendor-offer", {
      data: twoForOneOfferPayload(productMongoId, vendorMongoId, name),
    }),
  );
};

/**
 * Ends the product's 2×1. The API deletes only inactive offers ("An active
 * offer must be deactivated before it can be deleted"), so it is switched
 * off first, then deleted.
 */
export const removeTwoForOneReq = async (offerId: string) => {
  const off = await catchAsync<null>(async () => serverRequest.patch(`/offers/toggle-status/${offerId}`));
  if (!off.success) return off;
  return catchAsync<null>(async () => serverRequest.delete(`/offers/soft-delete/${offerId}`));
};
