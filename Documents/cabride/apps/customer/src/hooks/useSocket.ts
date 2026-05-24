"use client";
import { useEffect, useRef, useCallback } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";

export const useSocket = (userId: string | undefined) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;
    socketRef.current = getSocket(userId);

    return () => { disconnectSocket(); };
  }, [userId]);

  const emit = useCallback((event: string, data?: object) => {
    socketRef.current?.emit(event, data);
  }, []);

  const on = useCallback((event: string, handler: (...args: any[]) => void) => {
    socketRef.current?.on(event, handler);
    return () => { socketRef.current?.off(event, handler); };
  }, []);

  return { socket: socketRef.current, emit, on };
};
