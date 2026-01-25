"use client";

import { getSOSSocket } from "@/lib/socket";
import { TSOS } from "@/types/sos.type";
import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface IProps {
  token: string;
  onNewSOSAlert: ({ message, data }: { message: string; data: TSOS }) => void;
}

export function useSOSSocket({ token, onNewSOSAlert }: IProps) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = getSOSSocket(token);
    socketRef.current = socket;

    socket.emit("join-sos-monitoring");

    socket.on("new-sos-alert", onNewSOSAlert);

    return () => {
      socket.off("SOS_ALERTS_POOL");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
