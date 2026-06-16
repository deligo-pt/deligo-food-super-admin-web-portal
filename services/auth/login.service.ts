"use server";

import { DEVICE_KEY } from "@/consts/device.const";
import { TDeviceDetails } from "@/types";
import { catchAsync } from "@/utils/catchAsync";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

export const loginReq = async (data: {
  email: string;
  password: string;
  forceLogin?: boolean;
  deviceDetails: TDeviceDetails;
}) => {
  return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Failed to login");
    }

    return result;
  });
};

export const logoutReq = async () => {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_KEY)?.value || "";

  const cookieStr = cookieStore.toString();
  const accessToken = cookieStore.get("accessToken")?.value || "";

  return catchAsync<null>(async () => {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { authorization: `Bearer ${accessToken}` }),
        ...(cookieStr && { cookie: cookieStr }),
      },
      body: JSON.stringify({
        deviceId
      }
      ),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result?.message || "Logout failed!");
    }

    return result;
  });
};


// export const loginReq = async (data: {
//   email: string;
//   password: string;
//   forceLogin?: boolean;
//   deviceDetails: TDeviceDetails;
// }) => {
//   return catchAsync<{ accessToken: string; refreshToken: string }>(async () => {
//     const response = await serverFetch.post("/auth/login", {
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });
//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result?.message || "Failed to log in");
//     }

//     return result;
//   });
// };

// export const logoutReq = async () => {
//   const deviceId = (await cookies()).get(DEVICE_KEY)?.value || "";

//   return catchAsync<null>(async () => {
//     const response = await serverFetch.post("/auth/logout", {
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ deviceId }),
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result?.message || "Failed to log out");
//     }

//     return result;
//   });
// };

