"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TProductCategory } from "@/types/category.type";
import { catchAsync } from "@/utils/catchAsync";

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

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
  };

  const result = await catchAsync<TProductCategory[]>(async () => {
    return await serverRequest.get("/categories/productCategory", {
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

export const getSingleProductCategoryReq = async (id: string) => {
  const result = await catchAsync<TProductCategory>(async () => {
    return await serverRequest.get(`/categories/productCategory/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};
