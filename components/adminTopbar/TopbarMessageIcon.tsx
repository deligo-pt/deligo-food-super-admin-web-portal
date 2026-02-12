"use client";

import { useAdminChatSocket } from "@/hooks/use-chat-socket";
import { getCookie } from "@/utils/cookies";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useRef } from "react";

export default function TopbarMessageIcon() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const accessToken = getCookie("accessToken") || "";

  const newMessageHandler = () => {
    audioRef.current?.play().catch((error) => {
      console.log("Error playing audio:", error);
    });
  };

  useAdminChatSocket({
    token: accessToken as string,
    onMessage: () => newMessageHandler(),
  });

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        className="p-2 rounded-lg hover:bg-pink-50 transition hidden sm:block shrink-0 relative"
      >
        <MessageSquare size={18} className="text-gray-700" />
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-pink-600 rounded-full border-2 border-white"
        />
      </motion.button>
      <div className="hidden">
        <audio ref={audioRef} src="/audio/message-sound.mp3" preload="auto" />
      </div>
    </>
  );
}
