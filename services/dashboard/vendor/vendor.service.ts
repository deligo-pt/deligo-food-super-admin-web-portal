"use server";

import { USER_ROLE } from "@/consts/user.const";
import { serverFetch } from "@/lib/fetchHelper";
import { serverRequest } from "@/lib/serverFetch";
import { TMeta } from "@/types";
import { TVendor } from "@/types/user.type";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";

export const getAllVendorsReq = async (
  queries: Record<string, string | undefined>,
  role?: string
): Promise<{ data: TVendor[]; meta?: TMeta }> => {
  const limit = Number(queries?.limit || 10);
  const page = Number(queries.page || 1);
  const searchTerm = queries.searchTerm || "";
  const sortBy = queries.sortBy || "-createdAt";
  const status = queries.status || "";
  const businessType = queries.businessType || "";

  const params = {
    limit,
    page,
    sortBy,
    ...(searchTerm ? { searchTerm: searchTerm } : {}),
    ...(status ? { status: status } : {}),
    ...(businessType ? { businessType: businessType } : {}),
    isDeleted: false,
    role: role ? role : USER_ROLE.VENDOR,
  };

  const result = await catchAsync<TVendor[]>(async () => {
    return await serverRequest.get("/vendors", {
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

export const getSingleVendorReq = async (id: string) => {
  const result = await catchAsync<TVendor>(async () => {
    return await serverRequest.get(`/vendors/${id}`);
  });

  if (result?.success) return result.data;

  return {};
};

export const getAllBranches = async (id: string, query?: string,) => {
  const result = await catchAsync(async () => {
    const response = await serverFetch.get(
      `/vendors/${id}/branches${query ? `?${query}` : ""}`,
    );

    return await response.json();
  });

  return result;
};

// product.service.ts
export const copyProductsToSubVendors = async (payload: {
  sourceVendorId: string;
  productIds?: string[];
  targetSubVendorIds?: string[];
  copyAllProducts?: boolean;
  copyToAllTargetSubVendors?: boolean;
}) => {
  const result = await catchAsync(async () => {
    const response = await serverFetch.post(
      `/products/copy-to-sub-vendors`, {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
    );
    return await response.json();
  });

  if (result.success) {
    revalidateTag("products", {});
    revalidatePath("/admin/vendor/branch/all");
  };

  return result;
};