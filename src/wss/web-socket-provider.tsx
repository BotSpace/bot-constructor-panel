"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";

type WebSocketType = WebSocket | null;

const WebSocketContext = createContext<WebSocketType>(null);

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 10;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { changeRelease, project, changeDebug, changeProject } =
    useProjectStore();
  const socketRef = useRef<WebSocketType>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const session = useSession();

  const connect = useCallback(() => {
    if (session.status !== "authenticated" || !project) return;

    // Eski ulanishni tozalash
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const ws = new WebSocket(
      `wss://api.botmother.uz/ws/events?token=${session.data.user.access}`
    );

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WS connected");
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (msg) => {
      const message = JSON.parse(msg.data);

      switch (message["event"]) {
        case "release_status":
          const version = message["data"]["version"];
          if (
            version > (project.release?.version || 0) &&
            project.id === message["data"]["project"]
          ) {
            changeProject({
              ...project,
              release_bot: true,
            });
            changeRelease(message["data"]);
          }
          break;
        case "debug_status":
          if (project.id === message["data"]["project"])
            changeDebug(message["data"]);
          break;
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WS error:", error);
    };

    ws.onclose = () => {
      console.log("WS closed");
      socketRef.current = null;

      // Avtomatik qayta ulanish
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        console.log(
          `WS reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`
        );
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      } else {
        console.warn("WS max reconnect attempts reached");
      }
    };
  }, [session.status, session.data, project, changeRelease, changeDebug, changeProject]);

  useEffect(() => {
    connect();

    return () => {
      // Cleanup: WS va timeout ni tozalash
      clearTimeout(reconnectTimeout.current);
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [connect]);

  return (
    <WebSocketContext.Provider value={socketRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
