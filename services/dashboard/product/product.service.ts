"use server";

import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TAddonGroup } from "@/types/add-ons.type";
import { TProduct } from "@/types/product.type";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";

export const deleteProductReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/products/soft-delete/${id}`);
  });
};

export const getSingleProductReq = async (id: string) => {
  const result = await catchAsync<TProduct>(async () => {
    return await serverRequest.get(`/products/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllProductsReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { "meta.status": status } : {}),
    // ...(status ? { "stock.availabilityStatus": status } : {}),
  };

  const result = await catchAsync<TProduct[]>(async () => {
    return await serverRequest.get("/products", {
      params,
    });
  });

  return result;

  // if (result?.success)
  //   return {
  //     data: result.data,
  //     meta: result.meta,
  //   };

  // return {
  //   data: [],
  // };
};

export const deleteProductImage = async (productId: string, payload: { images: string[] }) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(`/products/${productId}/images`, {
      data: payload
    });
  });
};

// addon groups related
export const getAllAddOnsGroup = async (queryString?: string) => {
  const url = `/add-ons${queryString ? `?${queryString}` : ""}`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["addons"],
      },
    });
    return await res.json();
  });

  return result;
};


// create addon groups
export const createAdminAddonGroupReq = async (data: Partial<TAddonGroup>) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.post(`/add-ons/admin/create-group`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  });

  if (result.success) {
    revalidateTag("addons", {});
    revalidatePath(`/admin/vendor/${data?.vendorId}`);
  };


  return result;
};

export const updateAddOnsGroup = async (id: string, data: Partial<TAddonGroup>) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(`/add-ons/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  });

  if (result.success) {
    revalidateTag("addons", {});
    revalidatePath(`/admin/vendor/${data?.vendorId}`);
  };


  return result;
};