"use client";

import { useAdminChatSocket } from "@/hooks/use-chat-socket";
import { getUnreadCountReq } from "@/services/chat/chat";
import { getCookie } from "@/utils/cookies";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function TopbarMessageIcon() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const accessToken = getCookie("accessToken") || "";
  const [unreadCount, setUnreadCount] = useState(0);

  const getUnreadMessageCount = async () => {
    const result = await getUnreadCountReq();

    if (result.success) {
      setUnreadCount(result.data || 0);
    }
  };

  const newMessageHandler = () => {
    getUnreadMessageCount();
    audioRef.current?.play().catch((error) => {
      console.log("Error playing audio:", error);
    });
  };

  useAdminChatSocket({
    token: accessToken as string,
    onMessage: () => newMessageHandler(),
  });

  useEffect(() => {
    (() => getUnreadMessageCount())();
  }, []);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        className="p-2 rounded-lg hover:bg-pink-50 transition hidden sm:block shrink-0 relative"
      >
        <MessageSquare size={18} className="text-gray-700" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-pink-600 rounded-full border-2 border-white text-[10px] text-white font-medium flex justify-center items-center"
          >
            {unreadCount > 99 ? "99" : unreadCount}
          </motion.span>
        )}
      </motion.button>
      <div className="hidden">
        <audio ref={audioRef} src="/audio/message-sound.mp3" preload="auto" />
      </div>
    </>
  );
}
