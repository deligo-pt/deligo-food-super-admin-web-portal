"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import type {
  ZoneListResponse,
  ZoneSingleResponse,
  CreateZonePayload,
  GeoJsonPolygon,
} from "@/types/zone.type";
import { catchAsync } from "@/utils/catchAsync";
import { serverFetch } from "@/lib/fetchHelper";

// GET ALL ZONES
export const getAllZones = async (queryString?: string) => {
  const url = `/zones/all-zones${queryString ? `?${queryString}` : ""}`;

  const result = await catchAsync<ZoneListResponse>(async () => {
    const res = await serverFetch.get(url, {
      next: {
        tags: ["zones"],
        revalidate: 30,
      },
    });
    return await res.json();
  });

  return result;
};

// GET SINGLE ZONE
export const getZoneById = async (zoneId: string) => {
  const result = await catchAsync<ZoneSingleResponse>(async () => {
    const res = await serverFetch.get(`/zones/${zoneId}`, {
      next: {
        tags: [`zone-${zoneId}`],
        revalidate: 30,
      },
    });
    return await res.json();
  });

  return result;
};

// VALIDATE BOUNDARY
export const validateBoundary = async (data: {
  boundary: GeoJsonPolygon;
  excludeZoneId?: string;
}) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.post(`/zones/validate-boundary`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  });
  return result;
};

// CREATE ZONE
export const createZone = async (data: CreateZonePayload) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.post(`/zones/create-zone`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  });

  if (result.success) {
    revalidateTag("zones", {});
    revalidatePath("/admin/zones");
  }
  return result;
};

// TOGGLE STATUS
export const toggleZoneStatus = async (
  zoneId: string,
  isOperational: boolean
) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(`/zones/${zoneId}/toggle-status`, {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isOperational }),
    });
    return await res.json();
  });

  if (result.success) {
    revalidateTag("zones", {});
    revalidateTag(`zone-${zoneId}`, {});
    revalidatePath("/admin/zones");
  }
  return result;
};

// SOFT DELETE
export const softDeleteZone = async (zoneId: string) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.patch(`/zones/${zoneId}/soft-delete`);
    return await res.json();
  });

  if (result.success) {
    revalidateTag("zones", {});
    revalidatePath("/admin/zones");
  }
  return result;
};

// PERMANENT DELETE
export const permanentDeleteZone = async (zoneId: string) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.delete(`/zones/${zoneId}/permanent-delete`);
    return await res.json();
  });

  if (result.success) {
    revalidateTag("zones", {});
    revalidatePath("/admin/zones");
  }
  return result;
};

// CHECK POINT (optional – for later)
export const checkPointInZone = async (lng: string | number, lat: string | number) => {
  const result = await catchAsync(async () => {
    const res = await serverFetch.get(
      `/zones/check-point?lng=${lng}&lat=${lat}`
    );
    return await res.json();
  });
  return result;
};