"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TBusinessCategory } from "@/types/category.type";
import { catchAsync } from "@/utils/catchAsync";

export const addBusinessCategoryReq = async (
  data: Partial<TBusinessCategory>,
  image?: File | null
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
  image?: File | null
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
      `/categories/businessCategory/soft-delete/${id}`
    );
  });
};
