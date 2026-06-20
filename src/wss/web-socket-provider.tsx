"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useDebugStatusStore } from "@/features/bot-constructor/store/debug-status";
import { useFlowStore } from "@/features/bot-constructor/store";
import { getNodeManifestByType } from "@/features/bot-constructor/nodes/registry/manifestStore";
import { useDebugContextStore } from "@/components/layout/components/debug-console/debug-context-store";
import { useDebugErrorsStore } from "@/features/bot-constructor/store/debug-errors";
import { getSession, useSession } from "@/lib/session-client";
import { useEffect, useRef } from "react";
import { wsHub } from "./ws-hub";
import toast from "react-hot-toast";

/**
 * Yupqa provider — butun ulanish hayoti endi `wsHub`da (yagona singleton):
 * watchdog har 1s readyState tekshiradi, uzilsa cheksiz backoff bilan qayta
 * ulaydi, idle'da app-level ping/echo bilan yarim-ochiq ulanishlarni tutadi,
 * har (qayta)ulanishda YANGI access token oladi. Bu komponent faqat hub'ni
 * yoqadi va kelgan eventlarni store'larga tarqatadi.
 */
// Debounce toast spam: show at most one error toast every 3 seconds.
const ERROR_TOAST_DEBOUNCE_MS = 3_000;

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const authed = session.status === "authenticated";
  const lastErrorToastRef = useRef<number>(0);

  // Hub lifecycle — login bo'lganda yoqamiz. Token har ulanishda yangidan
  // so'raladi (eskirgan token bilan reconnect urinish muammosi yo'q).
  useEffect(() => {
    if (!authed) return;
    wsHub.start(async () => (await getSession())?.user?.access ?? null);
    return () => wsHub.stop();
  }, [authed]);

  // Event dispatch — store'lardan DOIM eng so'nggi holat o'qiladi (stale
  // closure yo'q), shuning uchun obuna bir marta o'rnatiladi.
  useEffect(() => {
    return wsHub.subscribe((event, data) => {
      const store = useProjectStore.getState();
      const project = store.project;
      if (!project) return;

      switch (event) {
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
        case "context": {
          // Variable inspector snapshot — backend: {project, chat_id, variables, ts}
          if (String(data.project) === String(project.id)) {
            const chatId = String(data.chat_id ?? "unknown");
            const variables = (data.variables as Record<string, unknown>) ?? {};
            // ts: backend yuborsa — UnixMilli raqam yoki ISO string.
            // Raqam string sifatida kelsa new Date() ishlamaydi, shuning uchun
            // raqam ekanligini tekshirib number sifatida saqlaymiz.
            const rawTs = data.ts;
            const ts: number | string =
              typeof rawTs === "number"
                ? rawTs
                : typeof rawTs === "string" && /^\d+$/.test(rawTs.trim())
                ? Number(rawTs)
                : typeof rawTs === "string" && rawTs.length > 0
                ? rawTs
                : Date.now();
            useDebugContextStore.getState().setSnapshot(chatId, { variables, ts });
          }
          break;
        }
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
            const { nodes } = useFlowStore.getState();

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
            // NOTE: accessory (tool/provider) node statuslari endi engine
            // tomonidan aniq per-node event sifatida yuboriladi. Blind
            // propagation olib tashlandi — har bir accessory o'z node_execution
            // eventidan status oladi.
          }
          break;
        }
        case "error": {
          // Flow execution error — {project, chat_id, node_id, node_type, message, detail, ts}
          if (String(data.project) === String(project.id)) {
            const raw = {
              project: data.project as string | number,
              chat_id: data.chat_id as string | number | undefined,
              node_id: data.node_id as string | undefined,
              node_type: data.node_type as string | undefined,
              message: (data.message as string) || "Unknown error",
              detail: data.detail as string | undefined,
              ts: (data.ts as number | string) ?? Date.now(),
            };
            useDebugErrorsStore.getState().addError(raw);

            // Debounced toast so rapid errors don't spam
            const now = Date.now();
            if (now - lastErrorToastRef.current >= ERROR_TOAST_DEBOUNCE_MS) {
              lastErrorToastRef.current = now;
              const nodeLabel = raw.node_type
                ? `[${raw.node_type}]`
                : raw.node_id
                ? `[${raw.node_id}]`
                : "";
              toast.error(
                `${nodeLabel ? nodeLabel + " " : ""}${raw.message}`.trim(),
                { duration: 4000, id: "flow-error-toast" }
              );
            }
          }
          break;
        }
        default:
          break;
      }
    });
  }, []);

  return <>{children}</>;
}
