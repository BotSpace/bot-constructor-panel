"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef } from "react";

type WebSocketType = WebSocket | null;

const WebSocketContext = createContext<WebSocketType>(null);

const MAX_RECONNECT_ATTEMPTS = 10;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { changeRelease, project, changeDebug, changeProject } =
    useProjectStore();
  const socketRef = useRef<WebSocketType>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const session = useSession();

  useEffect(() => {
    console.log(project);
    
    const connectWebSocket = () => {
      if (session.status !== "authenticated" || !project) {
        return;
      }

      // Clean up existing connection
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }

      const ws = new WebSocket(
        `wss://api.botmother.uz/ws/events?token=${session.data.user.access}`
      );

      socketRef.current = ws;

      ws.onopen = () => {
        console.log("WS connected");
        reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful connection
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

        // Attempt to reconnect with exponential backoff
        if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          const delay = Math.min(
            INITIAL_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current),
            MAX_RECONNECT_DELAY
          );
          
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`
          );
          
          reconnectAttemptsRef.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else {
          console.error("Max reconnection attempts reached. Please refresh the page.");
        }
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.onclose = null;
        socketRef.current.onerror = null;
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [session.status, project, changeRelease, changeDebug, changeProject]);

  return (
    <WebSocketContext.Provider value={socketRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
