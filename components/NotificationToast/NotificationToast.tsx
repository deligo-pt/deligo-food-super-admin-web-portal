"use client";

import { messaging } from "@/config/firebase";
import { MessagePayload, onMessage } from "firebase/messaging";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function NotificationToast() {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!messaging) return;

    const unsub = onMessage(messaging, (payload: MessagePayload) => {
      console.log("Foreground message:", payload);
      audioRef.current?.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      // Show notification with more details
      toast.info(payload.notification?.title, {
        description: payload.notification?.body,
        duration: 5000,
        // Add action buttons if needed
        action: payload.data?.url
          ? {
              label: "Open",
              onClick: () => window.open(payload.data?.url, "_blank"),
            }
          : undefined,
      });
    });

    return () => unsub();
  }, []);

  return (
    <div className="hidden">
      <audio
        ref={audioRef}
        src="/audio/notification-sound.mp3"
        preload="auto"
      />
    </div>
  );
}
