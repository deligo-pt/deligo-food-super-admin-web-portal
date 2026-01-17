"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TProductCategory } from "@/types/category.type";
import { catchAsync } from "@/utils/catchAsync";

export const addProductCategoryReq = async (
  data: Partial<TProductCategory>,
  image?: File | null
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
  image?: File | null
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
      `/categories/productCategory/soft-delete/${id}`
    );
  });
};
