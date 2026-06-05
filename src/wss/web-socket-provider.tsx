"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useDebugStatusStore } from "@/features/bot-constructor/store/debug-status";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry/manifestStore";
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
        case "node_execution": {
          // project may be int (backend) — compare loosely against current project
          if (String(data.project) === String(project.id) && data.node_id) {
            const nodeId = data.node_id as string;
            const status = data.status as "waiting" | "running" | "success" | "error";
            const ts = typeof data.ts === "number" ? (data.ts as number) : undefined;
            const error = data.error as string | undefined;
            // Engine 3.5.31+: run_id (har update uchun monotonik) + seq (atomik) —
            // eventlar tartibini tarmoq emas, engine belgilaydi. Store yangi
            // run_id'da o'zi reset qiladi, eski run eventlarini tashlaydi.
            const runId =
              typeof data.run_id === "number" && data.run_id > 0
                ? (data.run_id as number)
                : undefined;
            const seq = typeof data.seq === "number" ? (data.seq as number) : undefined;

            const debugStore = useDebugStatusStore.getState();
            const { nodes, edges } = useFlowStore.getState();

            // LEGACY (run_id'siz eski engine): trigger running kelganda reset.
            // run_id bor bo'lsa bu shart emas — store o'zi boshqaradi va bu
            // yo'lning "kechikkan trigger eventi keyin kelgan success'ni
            // o'chiradi" poygasi ham yo'q.
            if (runId === undefined && status === "running") {
              const flowNode = nodes.find((n) => n.id === nodeId);
              const manifest = flowNode?.type
                ? getNodeManifestByType(flowNode.type)
                : undefined;
              if (manifest?.sidebar?.groupId === "triggers") {
                const triggerIds = nodes
                  .filter(
                    (n) =>
                      n.type &&
                      getNodeManifestByType(n.type)?.sidebar?.groupId === "triggers"
                  )
                  .map((n) => n.id);
                debugStore.startNewRun(triggerIds);
              }
            }

            debugStore.setNodeStatus(nodeId, status, ts, error, runId, seq);

            // Trigger ishlaganda u ham yashil bo'lib QOLADI (avval 1.5s dan
            // keyin sariqqa qaytarilardi) — keyingi run kelganda reset bo'ladi.

            // Propagate status to accessory nodes (e.g. LLM node connected to AI agent)
            const accessorySourceIds = edges
              .filter(
                (e) =>
                  e.target === nodeId &&
                  typeof e.targetHandle === "string" &&
                  e.targetHandle.startsWith("acc:")
              )
              .map((e) => e.source);
            for (const accId of accessorySourceIds) {
              debugStore.setNodeStatus(accId, status, ts, error, runId, seq);
            }
          }
          break;
        }
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
