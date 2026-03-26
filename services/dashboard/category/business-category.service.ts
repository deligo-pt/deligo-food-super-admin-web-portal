"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TBusinessCategory } from "@/types/category.type";
import { catchAsync } from "@/utils/catchAsync";

export const addBusinessCategoryReq = async (
  data: Partial<TBusinessCategory>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.post("/categories/businessCategory", {
      data: formData,
    });
  });
};

export const updateBusinessCategoryReq = async (
  id: string,
  data: Partial<TBusinessCategory>,
  image?: File | null,
) => {
  return catchAsync<null>(async () => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    return await serverRequest.patch(`/categories/businessCategory/${id}`, {
      data: formData,
    });
  });
};

export const deleteBusinessCategoryReq = async (id: string) => {
  return catchAsync<null>(async () => {
    return await serverRequest.delete(
      `/categories/businessCategory/soft-delete/${id}`,
    );
  });
};

export const getAllBusinessCategoriesReq = async (
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
    ...(status ? { status: status } : {}),
  };

  const result = await catchAsync<TBusinessCategory[]>(async () => {
    return await serverRequest.get("/categories/businessCategory", {
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

export const getSingleBusinessCategoryReq = async (id: string) => {
  const result = await catchAsync<TBusinessCategory>(async () => {
    return await serverRequest.get(`/categories/businessCategory/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
