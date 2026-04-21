import { messaging } from "@/config/firebase";
import { postData } from "@/utils/requests";
import { getToken } from "firebase/messaging";

const FCM_TOKEN_KEY = "deligo-admin-fcm-token";

export async function getFcmToken(): Promise<string | null> {
  const localToken = localStorage.getItem(FCM_TOKEN_KEY);
  console.log("local token", localToken);
  console.log("vapid", process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY);
  if (localToken) return localToken;

  if (!messaging) return null;
  if (!("serviceWorker" in navigator)) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.ready;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
    serviceWorkerRegistration: registration,
  });

  console.log("token", token);

  if (token) {
    localStorage.setItem(FCM_TOKEN_KEY, token);
  }

  return token;
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
