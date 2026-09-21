/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TProductCategory } from "@/types/category.type";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";

export const addProductCategoryReq = async (
  data: Partial<TProductCategory>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.post("/categories/productCategory", {
      data: formData,
    });
  });
};

export const updateProductCategoryReq = async (
  id: string,
  data: Partial<TProductCategory>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.patch(`/categories/productCategory/${id}`, {
      data: formData,
    });
  });
};

export const deleteProductCategoryReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(
      `/categories/productCategory/soft-delete/${id}`,
    );
  });
};

export const getAllProductCategoriesReq = async (
  queries: Record<string, string | undefined>,
) => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";
  const lang = queries.lang || "en";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
  };

  const result = await catchAsync<{ data: TProductCategory[]; meta: TMeta }>(
    async () => {
      return await serverRequest.get("/categories/productCategory", {
        params,
        headers: {
          "Accept-Language": lang
        }
      });
    },
  );

  if (result?.success)
    return {
      data: result.data,
      meta: result.meta,
    };

  return {
    data: [],
  };
};

export const getSingleProductCategoryReq = async (id: string, lang: "en" | "pt" = "en") => {
  const result = await catchAsync<TProductCategory>(async () => {
    return await serverRequest.get(`/categories/productCategory/${id}`, {
      headers: {
        "Accept-Language": lang
      }
    });
  });

  if (result?.success) return result.data;

  return {};
};

// create admin product category
export const addAdminProductCategoryReq = async (data: any) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.post(`/product-categories/admin/create-product-category`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  });

  if (result.success) {
    revalidateTag("product-category", {});
    revalidatePath(`/admin/vendor/${data?.vendorId}`);
  };


  return result;
};

// update admin product category
export const updateAdminProductCategoryReq = async (categoryId: string, data: any) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(`/product-categories/${categoryId}`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    return await res.json();
  });

  if (result.success) {
    revalidateTag("product-category", {});
    if (data?.vendorId) {
      revalidatePath(`/admin/vendor/${data.vendorId}`);
    }
  }

  return result;
};

export const getAllProductCategories = async (queryString?: string) => {
  const url = `/product-categories${queryString ? `?${queryString}` : ""}`;

  const result = await catchAsync(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["product-category"],
      },
    });
    return await res.json();
  });

  return result;
};