import { messaging } from "@/config/firebase";
import { postData } from "@/utils/requests";
import { getToken } from "firebase/messaging";

export async function getFcmToken(): Promise<string | null> {
  if (!messaging) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  return await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!,
  });
}

export async function saveFcmToken(
  accessToken: string,
  token: string
): Promise<void> {
  const payload = { token };

  await postData("/auth/save-fcm-token", JSON.stringify(payload), {
    headers: {
      "Content-Type": "application/json",
      authorization: accessToken,
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
