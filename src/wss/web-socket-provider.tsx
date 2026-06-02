"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useDebugStatusStore } from "@/features/bot-constructor/store/debug-status";
import { useSession } from "@/lib/session-client";
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

    const access = session.data?.user?.access;
    if (!access) return;

    const ws = new WebSocket(
      `wss://api.botmother.uz/ws/events?token=${access}`
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
        case "node_execution": {
          const d = message["data"] ?? {};
          // project may be int (backend) — compare loosely against current project
          if (String(d.project) === String(project.id) && d.node_id) {
            useDebugStatusStore
              .getState()
              .setNodeStatus(d.node_id, d.status, d.error);
          }
          break;
        }
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      // WebSocket error - odatda connection muammosi
      // Backend server ishlamasa yoki token muddati o'tgan bo'lsa chiqadi
      if (process.env.NODE_ENV === 'development') {
        console.warn("WS connection error - backend may be unavailable");
      }
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
