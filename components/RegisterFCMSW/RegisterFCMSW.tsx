"use client";

import { useEffect } from "react";

export function RegisterFCMSW() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration("/").then((reg) => {
      if (!reg) {
        navigator.serviceWorker
          .register("/firebase-messaging-sw.js")
          .then(() => console.log("FCM SW registered"))
          .catch(console.log);
      }
    });
  }, []);

  return null;
}
