/* eslint-disable @typescript-eslint/no-explicit-any */
import { messaging } from "@/config/firebase";
import { updateFcmTockenReq } from "@/services/auth/fcm-token.service";
import { getDeviceInfo } from "@/utils/getDeviceInfo";
import { getToken } from "firebase/messaging";
import { cleanupFirebaseDatabases } from "./firebaseDBCleanup";

let isCleaning = false;

export async function getFcmToken(): Promise<string | null> {
  // Early exit if not supported
  if (typeof window === "undefined" || !messaging || !("serviceWorker" in navigator)) {
    return null;
  }

  try {
    // Don't hang on permission prompt
    const permission = Notification.permission;

    if (permission === "denied") return null;

    if (permission !== "granted") {
      // Request with timeout
      const permResult = await Promise.race([
        Notification.requestPermission(),
        new Promise<"denied">((resolve) => setTimeout(() => resolve("denied"), 4000)),
      ]);
      if (permResult !== "granted") return null;
    }

    const token = await Promise.race([
      getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("getToken timeout")), 7000)
      ),
    ]);

    return token || null;
  } catch (error: any) {
    console.warn("FCM getToken failed:", error);

    const isVersionError = error.name === "VersionError" ||
      error.message?.toLowerCase().includes("version");

    if (isVersionError && !isCleaning) {
      isCleaning = true;
      console.warn("[FCM] Version conflict detected. Running cleanup...");

      try {
        await cleanupFirebaseDatabases();
        await new Promise((r) => setTimeout(r, 1500));

        // Retry with timeout
        const retryToken = await Promise.race([
          getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY! }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error("Retry timeout")), 8000))
        ]);

        console.log("[FCM] Recovery successful");
        isCleaning = false;
        return retryToken || null;
      } catch (retryErr) {
        console.error("[FCM] Cleanup + retry failed:", retryErr);
      } finally {
        isCleaning = false;
      }
    }

    return null;
  }
}

// export async function getFcmToken(): Promise<string | null> {
//   try {
//     if (!messaging) return null;

//     if (!("serviceWorker" in navigator)) return null;

//     const permission = await Notification.requestPermission();

//     if (permission !== "granted") return null;

//     const registration = await navigator.serviceWorker.ready;

//     const token = await getToken(messaging, {
//       vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
//       serviceWorkerRegistration: registration,
//     });

//     return token;
//   } catch (error) {
//     console.error("Error getting FCM token:", error);
//     return null;
//   }
// }

export async function updateFcmToken(token: string, accessToken: string): Promise<void> {
  try {
    const deviceInfo = await getDeviceInfo();

    const result = await updateFcmTockenReq(
      {
        token,
        deviceId: deviceInfo.deviceId,
      },
      accessToken
    );


    if (result?.success) {
      console.log("FCM token updated successfully");
    } else {
      console.error("FCM update failed:", result);
    }
  } catch (err) {
    console.error("updateFcmToken crashed:", err);
  }
}

export async function getAndSaveFcmToken(accessToken: string): Promise<void> {
  try {
    if (!accessToken) {
      console.warn("No access token provided");
      return;
    }

    const token = await getFcmToken();

    if (!token) {
      console.warn("No FCM token generated");
      return;
    }

    const savedToken = localStorage.getItem(
      "deligo-admin-fcm-token"
    );

    if (token !== savedToken) {
      await updateFcmToken(token, accessToken);

      localStorage.setItem(
        "deligo-admin-fcm-token",
        token
      );
    }
  } catch (fcmError) {
    console.error("Failed to update FCM token:", fcmError);
  }
}
