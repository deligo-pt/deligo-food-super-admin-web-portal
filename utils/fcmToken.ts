import { messaging } from "@/config/firebase";
import { postData } from "@/utils/requests";
import { getToken } from "firebase/messaging";

const FCM_TOKEN_KEY = "deligo-admin-fcm-token";

export async function getFcmToken(): Promise<string | null> {
  const localToken = localStorage.getItem(FCM_TOKEN_KEY);
  if (localToken) return localToken;

  if (
    typeof window === "undefined" ||
    !messaging ||
    !("serviceWorker" in navigator)
  )
    return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      {
        scope: "/",
      },
    );

    const token = await Promise.race([
      getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
        serviceWorkerRegistration: registration,
      }),
      new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error("FCM_TIMEOUT")), 3000),
      ),
    ]);

    if (token && typeof token === "string") {
      localStorage.setItem(FCM_TOKEN_KEY, token);
      return token;
    }

    return null;
  } catch (error) {
    console.error("FCM Retrieval failed:", error);
    return null;
  }
}

export async function saveFcmToken(
  accessToken: string,
  token: string,
): Promise<void> {
  const payload = { token };

  await postData("/auth/save-fcm-token", JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function getAndSaveFcmToken(accessToken: string): Promise<void> {
  try {
    const token = await getFcmToken();
    if (!token) return;
    await saveFcmToken(accessToken, token);
  } catch (fcmError) {
    console.log(fcmError);
  }
}
