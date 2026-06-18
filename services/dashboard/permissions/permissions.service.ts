'use server';

import { serverFetch } from "@/lib/fetchHelper";
import { TSystemPermission } from "@/types/permission.type";
import { catchAsync } from "@/utils/catchAsync";


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


export const assignPermissionToAdminReq = async (adminId: string, payload: { permissionIds: string[] }) => {
    return await catchAsync<any>(async () => {
        const response = await serverFetch.patch(`/permissions/assign-permissions/${adminId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        return await response.json();
    });
};


export const revokePermissionFromAdminReq = async (adminId: string, payload: { permissionIds: string[] }) => {
    return await catchAsync<any>(async () => {
        const response = await serverFetch.patch(`/permissions/revoke-permissions/${adminId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        return await response.json();
    });
};