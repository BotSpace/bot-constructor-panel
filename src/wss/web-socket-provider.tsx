"use client";

import useProjectStore from "@/features/bot-constructor/store/project";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useDebugStatusStore } from "@/features/bot-constructor/store/debug-status";
import { useDebugContextStore } from "@/components/layout/debug-console/debug-context-store";
import { useDebugErrorsStore } from "@/features/bot-constructor/store/debug-errors";
import { getValidAccessToken, useSession } from "@/lib/session-client";
import { instanceAuth } from "@/services/instance";
import { useEffect, useRef } from "react";
import { wsHub } from "@/wss/ws-hub";
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
    wsHub.start(getValidAccessToken);
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
          // project id int yoki string kelishi mumkin — loose solishtiramiz
          // (context/node_execution case'laridagi bilan bir xil sabab).
          if (
            version > (project.release?.version || 0) &&
            String(data.project) === String(project.id)
          ) {
            store.changeProject({ ...project, release_bot: true });
            store.changeRelease(data as never);
          }
          break;
        }
        case "debug_status":
          if (String(data.project) === String(project.id)) store.changeDebug(data as never);
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
            if (typeof data.run_id !== "number" || data.run_id <= 0) {
              console.error("node_execution event is missing a valid run_id", data);
              break;
            }
            const runId = data.run_id;
            const seq = typeof data.seq === "number" ? (data.seq as number) : undefined;
            const executionId =
              typeof data.execution_id === "string" && data.execution_id.length > 0
                ? data.execution_id
                : undefined;
            const attempt =
              typeof data.attempt === "number" && data.attempt > 0
                ? data.attempt
                : undefined;

            useDebugStatusStore.getState().setNodeStatus(
              nodeId,
              status,
              ts,
              error,
              runId,
              seq,
              executionId,
              attempt
            );

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
          // Flow alert — {project, chat_id, node_id, node_type, level, message, detail, ts}
          // level: error | warning | info (absent → error, handled by the store).
          if (String(data.project) === String(project.id)) {
            const raw = {
              project: data.project as string | number,
              chat_id: data.chat_id as string | number | undefined,
              node_id: data.node_id as string | undefined,
              node_type: data.node_type as string | undefined,
              level: data.level,
              message: (data.message as string) || "Unknown error",
              detail: data.detail as string | undefined,
              ts: (data.ts as number | string) ?? Date.now(),
            };
            useDebugErrorsStore.getState().addError(raw);

            // Debounced toast so rapid alerts don't spam. Info goes to the panel
            // silently; warning/error pop a (level-styled) toast.
            const level = data.level === "warning" || data.level === "info" ? data.level : "error";
            const now = Date.now();
            if (level !== "info" && now - lastErrorToastRef.current >= ERROR_TOAST_DEBOUNCE_MS) {
              lastErrorToastRef.current = now;
              const nodeLabel = raw.node_type
                ? `[${raw.node_type}]`
                : raw.node_id
                ? `[${raw.node_id}]`
                : "";
              const text = `${nodeLabel ? nodeLabel + " " : ""}${raw.message}`.trim();
              if (level === "warning") {
                toast(text, { icon: "⚠️", duration: 4000, id: "flow-error-toast" });
              } else {
                toast.error(text, { duration: 4000, id: "flow-error-toast" });
              }
            }
          }
          break;
        }
        case "flow_changed": {
          // The AI agent updated this project's flow out-of-band. Reload the
          // canvas from the backend — unless the user has unsaved local edits,
          // which we must not clobber.
          if (String(data.project_id) !== String(project.id)) break;
          const flowStore = useFlowStore.getState();
          if (flowStore.isDirty) {
            toast(
              "🤖 Agent flow'ni yangiladi. Saqlanmagan o'zgarishlaringiz borligi uchun avtomatik yangilanmadi.",
              { icon: "⚠️", duration: 5000, id: "agent-flow-changed" },
            );
            break;
          }
          instanceAuth
            .get(`/projects/${project.id}`)
            .then((res) => {
              const flow = (res.data as { flow?: unknown })?.flow;
              if (flow) {
                useFlowStore.getState().loadFlow(flow as never);
                toast("🤖 Agent flow'ni yangiladi ✨", {
                  duration: 3000,
                  id: "agent-flow-changed",
                });
              }
            })
            .catch(() => {});
          break;
        }
        default:
          break;
      }
    });
  }, []);

  return <>{children}</>;
}
