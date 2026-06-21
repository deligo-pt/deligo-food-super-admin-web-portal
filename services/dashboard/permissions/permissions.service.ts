'use server';

import { serverFetch } from "@/lib/fetchHelper";
import { TSystemPermission } from "@/types/permission.type";
import { catchAsync } from "@/utils/catchAsync";
import { revalidatePath, revalidateTag } from "next/cache";


export const createPermissionReq = async (payload: Record<string, unknown>) => {
    return await catchAsync<TSystemPermission>(async () => {
        const response = await serverFetch.post("/permissions/create", {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result?.message || "Failed to create permission");
        }

        return result;
    });
};


export const getAllPermissionsReq = async (queryString?: string) => {
    const url = `/permissions${queryString ? `?${queryString}` : ""}`;

    const result = await catchAsync<TSystemPermission[]>(async () => {
        const res = await serverFetch.get(url, {
            next: {
                tags: ["permissions-list"],
                revalidate: 30,
            },
        });
        return await res.json();
    });

    if (result?.success) return result;

    return null;
};


export const getSinglePermissionReq = async (permissionId: string) => {
    const result = await catchAsync<TSystemPermission>(async () => {
        const response = await serverFetch.get(`/permissions/${permissionId}`, {
            next: {
                tags: ["permission", `permission-${permissionId}`],
                revalidate: 10,
            },
        });

        return await response.json();
    });

    if (result?.success) return result.data;

    return null;
};


export const updatePermissionReq = async (payload: Record<string, unknown>, permissionId: string) => {
    return await catchAsync<TSystemPermission>(async () => {
        const response = await serverFetch.patch(`/permissions/${permissionId}`, {
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result?.success) {
            revalidateTag("permissions-list", "tags")
        }

        return result;
    });
};


export const assignPermissionToAdminReq = async (adminId: string, payload: { permissionIds: string[] }) => {
    console.log("payload", payload);
    return await catchAsync(async () => {
        const response = await serverFetch.patch(`/permissions/assign-permissions/${adminId}`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        console.log('result', result);

        if (result?.success) {
            revalidateTag("permissions-list", "tags")
        }

        return result;
    });
};


export const revokePermissionFromAdminReq = async (adminId: string, payload: { permissionActions: string[] }) => {
    return await catchAsync(async () => {
        const response = await serverFetch.patch(`/permissions/revoke-permissions/${adminId}`, {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });
        const result = await response.json();

        if (result?.success) {
            revalidateTag("permissions-list", {})
            revalidatePath("/admin/permissions/revoke")
        }

        return result;
    });
};