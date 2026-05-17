import { messaging } from "@/config/firebase";
import { updateFcmTockenReq } from "@/services/auth/fcm-token.service";
import { getDeviceInfo } from "@/utils/getDeviceInfo";
import { getToken } from "firebase/messaging";

export async function getFcmToken(): Promise<string | null> {
  if (!messaging) return null;
  if (!("serviceWorker" in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  // const registration = await navigator.serviceWorker.ready;

  return await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    // serviceWorkerRegistration: registration,
  });
}

export async function updateFcmToken(token: string): Promise<void> {
  try {
    const deviceInfo = await getDeviceInfo();

    const result = await updateFcmTockenReq({
      token,
      deviceId: deviceInfo.deviceId,
    });

    if (result.success) {
      console.log("FCM token updated successfully!");
      return;
    }

    console.error("Failed to update FCM token:", result);
  } catch (err) {
    console.error("updateFcmToken failed:", err);
    throw err;
  }
}

export async function getAndSaveFcmToken(accessToken: string): Promise<void> {
  try {
    if (!accessToken) {
      console.warn("No access token provided, skipping FCM token update");
      return;
    }

    const token = await getFcmToken();
    if (!token) return;

    const savedToken = localStorage.getItem("deligo-admin-fcm-token");

    // Only hit the update API if the token is actually new
    if (token !== savedToken) {
      await updateFcmToken(token);
      localStorage.setItem("deligo-admin-fcm-token", token);
    }
  } catch (fcmError) {
    console.error("Failed to update FCM token:", fcmError);
  }
}
