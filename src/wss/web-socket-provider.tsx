"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useRef } from "react";

type WebSocketType = WebSocket | null;

const WebSocketContext = createContext<WebSocketType>(null);

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { changeRelease, project, changeDebug, changeProject } =
    useProjectStore();
  const socketRef = useRef<WebSocketType>(null);
  const session = useSession();

  useEffect(() => {
    console.log(project);
    if (!socketRef.current && session.status === "authenticated" && project) {
      const ws = new WebSocket(
        `wss://api.botmother.uz/ws/events/?token=${session.data.user.access}`
      );

      socketRef.current = ws;

      ws.onopen = () => console.log("WS connected");
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
      ws.onclose = () => console.log("WS closed");
    }
  }, [session.status, project]);

  return (
    <WebSocketContext.Provider value={socketRef.current}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocket = () => useContext(WebSocketContext);
