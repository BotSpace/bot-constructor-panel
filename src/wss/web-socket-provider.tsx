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
  const session = useSession();
  // Only the project ID drives (re)connection — NOT the whole project object,
  // which mutates on every WS message (changeRelease/changeDebug/changeProject)
  // and previously caused the socket to close+reopen in a loop.
  const projectId = useProjectStore((s) => s.project?.id);

  const socketRef = useRef<WebSocketType>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const access = session.data?.user?.access;
  const authed = session.status === "authenticated";

  const connect = useCallback(() => {
    if (!authed || !projectId || !access) return;

    // Already connected/connecting → do nothing (avoid duplicate sockets).
    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const ws = new WebSocket(`wss://api.botspace.uz/ws/events?token=${access}`);
    socketRef.current = ws;

    ws.onopen = () => {
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (msg) => {
      let message: { event?: string; data?: Record<string, unknown> };
      try {
        message = JSON.parse(msg.data);
      } catch {
        return;
      }

      // Read the LATEST project + actions from the store (no stale closure).
      const store = useProjectStore.getState();
      const project = store.project;
      if (!project) return;
      const data = (message.data ?? {}) as Record<string, unknown>;

      switch (message.event) {
        case "release_status": {
          const version = Number(data.version);
          if (
            version > (project.release?.version || 0) &&
            project.id === data.project
          ) {
            store.changeProject({ ...project, release_bot: true });
            store.changeRelease(data as never);
          }
          break;
        }
        case "debug_status":
          if (project.id === data.project) store.changeDebug(data as never);
          break;
        case "node_execution":
          // project may be int (backend) — compare loosely against current project
          if (String(data.project) === String(project.id) && data.node_id) {
            useDebugStatusStore
              .getState()
              .setNodeStatus(
                data.node_id as string,
                data.status as never,
                data.error as string | undefined
              );
          }
          break;
        default:
          break;
      }
    };

    ws.onerror = () => {
      if (process.env.NODE_ENV === "development") {
        console.warn("WS connection error - backend may be unavailable");
      }
    };

    ws.onclose = () => {
      socketRef.current = null;
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = RECONNECT_DELAY * Math.pow(2, reconnectAttempts.current);
        reconnectTimeout.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      }
    };
  }, [authed, projectId, access]);

  useEffect(() => {
    connect();

    return () => {
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
