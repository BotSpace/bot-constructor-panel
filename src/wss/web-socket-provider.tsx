"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

type WebSocketType = WebSocket | null;

const WebSocketContext = createContext<WebSocketType>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { changeRelease } = useProjectStore();
  const socketRef = useRef<WebSocketType>(null);
  const session = useSession();

  useEffect(() => {
    if (!socketRef.current && session.status === "authenticated") {
      const ws = new WebSocket(
        `wss://botlarnionasi.jscorp.uz/ws/events/?token=${session.data.user.access}`
      );

      socketRef.current = ws;

      ws.onopen = () => console.log("WS connected");
      ws.onmessage = (msg) => {
        const message = JSON.parse(msg.data);

        switch (message["event"]) {
          case "release_status":
            changeRelease(message["data"]);
            break;
          case "debug_status":

          default:
            break;
        }

        console.log(
          "🔍 ~ WebSocketProvider ~ src/wss/web-socket-provider.tsx:24 ~ data:",
          message
        );
      };
      ws.onclose = () => console.log("WS closed");
    }
  }, [session.status]);

  return (
    <WebSocketContext.Provider value={socketRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
