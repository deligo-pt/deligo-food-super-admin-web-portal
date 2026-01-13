"use server";

import { serverRequest } from "@/lib/serverFetch";
import { TResponse } from "@/types";
import { TProductCategory } from "@/types/category.type";

export const addProductCategoryReq = async (
  data: Partial<TProductCategory>,
  image?: File | null
) => {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    const result = (await serverRequest.post("/categories/productCategory", {
      data: formData,
    })) as TResponse<null>;

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);
    return {
      success: false,
      data: null,
      message:
        error?.response?.data?.message || "Product category addition failed",
    };
  }
};

export const updateProductCategoryReq = async (
  id: string,
  data: Partial<TProductCategory>,
  image?: File | null
) => {
  try {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));

    if (image) formData.append("file", image);

    const result = (await serverRequest.patch(
      `/categories/productCategory/${id}`,
      {
        data: formData,
      }
    )) as TResponse<null>;

    if (result.success) {
      return { success: true, data: result.data, message: result.message };
    }

    return { success: false, data: result.data, message: result.message };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.log(error?.response?.data);
    return {
      success: false,
      data: null,
      message:
        error?.response?.data?.message || "Product category update failed",
    };
  }
};
