import { messaging } from "@/config/firebase";
import { updateFcmTockenReq } from "@/services/auth/fcm-token.service";
import { getDeviceInfo } from "@/utils/getDeviceInfo";
import { getToken } from "firebase/messaging";

export async function getFcmToken(): Promise<string | null> {
  try {
    if (!messaging) return null;

    if (!("serviceWorker" in navigator)) return null;

    const permission = await Notification.requestPermission();

    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.ready;

    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
      serviceWorkerRegistration: registration,
    });

    return token;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

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
