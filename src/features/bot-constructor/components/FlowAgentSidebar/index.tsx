"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  ActiveAgentRun,
  AgentMessage,
  AgentStreamEvent,
  ClarifyRequest,
  answerAgentClarification,
  createAgentEventStream,
  createAgentRun,
  getActiveAgentRuns,
  getAgentRunStatus,
  getProjectAgentMessages,
} from "@/services/requests/flow-agent";
import { cn } from "@/lib/utils";
import { getSession } from "next-auth/react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronDown,
  Circle,
  GitBranch,
  Loader2,
  MessageCircleQuestion,
  Pencil,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { type Dispatch, type SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";
import { Edge, Node } from "reactflow";
import remarkGfm from "remark-gfm";

type PlanStatus = "pending" | "running" | "done" | "error";

interface PlanItem {
  id: string;
  title: string;
  status: PlanStatus;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system" | "activity-group" | "plan";
  content: string;
  activities?: Array<{
    id: string;
    content: string;
    eventType?: string;
  }>;
  eventType?: string;
  planItems?: PlanItem[];
  planRunning?: boolean;
  createdAt?: string;
}

type ClarificationOption = {
  id?: string;
  option_id?: string;
  value?: string;
  label?: string;
  text?: string;
};

type ClarificationQuestion = {
  id?: string;
  question: string;
  details?: string;
  selection_type?: "single" | "multiple";
  options?: ClarificationOption[];
  allow_free_text?: boolean;
};

type ClarificationPayload =
  | ClarificationQuestion
  | {
      questions: ClarificationQuestion[];
    };

interface FlowAgentSidebarProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function getAccessToken() {
  const session = await getSession();
  const token = (session?.user as { access?: string } | undefined)?.access;
  if (!token) {
    throw new Error("Agent uchun auth token topilmadi");
  }

  return token;
}

function isRenderableHistoryMessage(
  message: AgentMessage
): message is AgentMessage & { role: "user" | "assistant" } {
  return message.role === "user" || message.role === "assistant";
}

function getOptionId(option: ClarificationOption) {
  return option.option_id || option.id || option.value || "";
}

function getOptionLabel(option: ClarificationOption) {
  return option.label || option.text || option.value || option.id || option.option_id || "";
}

function getAnsweredClarificationKey(projectId: string, requestId: string) {
  return `flow-agent:${projectId}:${requestId}:clarification-answered`;
}

function isClarificationAnswered(projectId: string, requestId: string) {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(getAnsweredClarificationKey(projectId, requestId)) === "1";
}

function markClarificationAnswered(projectId: string, requestId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getAnsweredClarificationKey(projectId, requestId), "1");
}

function clearClarificationAnswered(projectId: string, requestId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(getAnsweredClarificationKey(projectId, requestId));
}

function shouldRenderActivityDescription(eventType: AgentStreamEvent["type"]) {
  return eventType === "run_started" || eventType === "tool_call";
}

function normalizePlanItems(payload: Record<string, unknown>): PlanItem[] {
  const rawItems =
    (Array.isArray(payload.items) && payload.items) ||
    (Array.isArray(payload.tasks) && payload.tasks) ||
    (Array.isArray((payload.plan as Record<string, unknown> | undefined)?.items) &&
      ((payload.plan as Record<string, unknown>).items as unknown[])) ||
    [];

  return rawItems.map((item, index) => {
    const value = item as Record<string, unknown>;
    const title = String(value.title || value.name || value.content || `Bosqich ${index + 1}`);
    const rawStatus = String(value.status || "pending");
    const status: PlanStatus =
      rawStatus === "done" || rawStatus === "completed"
        ? "done"
        : rawStatus === "running" || rawStatus === "in_progress"
          ? "running"
          : rawStatus === "error" || rawStatus === "failed"
            ? "error"
            : "pending";

    return {
      id: String(value.id || value.index || index),
      title,
      status,
    };
  });
}

function sortActiveRuns(runs: ActiveAgentRun[]) {
  return [...runs].sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at).getTime();
    const bTime = new Date(b.updated_at || b.created_at).getTime();
    return bTime - aTime;
  });
}

function appendMessageUnique(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  message: ChatMessage
) {
  setMessages((current) => {
    const exists = current.some(
      (item) =>
        item.id === message.id ||
        (item.role === message.role && item.content === message.content)
    );
    return exists ? current : [...current, message];
  });
}

function appendActivityMessage(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  requestId: string,
  activity: { id: string; content: string; eventType?: string }
) {
  const groupId = `${requestId}-activity-group`;
  setMessages((current) => {
    const group = current.find((message) => message.id === groupId);
    if (!group) {
      return [
        ...current,
        {
          id: groupId,
          role: "activity-group",
          content: "Activity",
          activities: [activity],
        },
      ];
    }

    return current.map((message) => {
      if (message.id !== groupId) return message;
      const activities = message.activities || [];
      if (activities.some((item) => item.id === activity.id)) return message;
      return {
        ...message,
        activities: [...activities, activity],
      };
    });
  });
}

function upsertPlanMessage(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  requestId: string,
  items: PlanItem[],
  running: boolean
) {
  const id = `${requestId}-plan`;
  setMessages((current) => {
    const exists = current.some((message) => message.id === id);
    if (!exists) {
      return [
        ...current,
        {
          id,
          role: "plan",
          content: "Plan",
          planItems: items,
          planRunning: running,
        },
      ];
    }

    return current.map((message) =>
      message.id === id
        ? {
            ...message,
            planItems: items,
            planRunning: running,
          }
        : message
    );
  });
}

function upsertById<T extends { id: string }>(items: T[], nextItem: T) {
  const exists = items.some((item) => item.id === nextItem.id);
  if (!exists) return [...items, nextItem];
  return items.map((item) => (item.id === nextItem.id ? { ...item, ...nextItem } : item));
}

function upsertNode(nodes: Node[], nextNode: Node) {
  return upsertById(nodes, nextNode);
}

function patchNode(nodes: Node[], nextNode: Node) {
  const exists = nodes.some((node) => node.id === nextNode.id);
  if (!exists) return [...nodes, nextNode];

  return nodes.map((node) =>
    node.id === nextNode.id
      ? {
          ...node,
          ...nextNode,
          data: {
            ...(node.data || {}),
            ...(nextNode.data || {}),
          },
        }
      : node
  );
}

function upsertEdge(edges: Edge[], nextEdge: Edge) {
  return upsertById(edges, nextEdge);
}

export function FlowAgentSidebar({
  projectId,
  open,
  onOpenChange,
}: FlowAgentSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [planItems, setPlanItems] = useState<PlanItem[]>([]);
  const [clarification, setClarification] = useState<ClarificationPayload | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const processedSeqRef = useRef(0);
  const formatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { nodes, edges, setNodes, setEdges, formatFlow, withSilentFlowUpdate } =
    useFlowStore();

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, clarification]);

  useEffect(() => {
    return () => {
      cleanupRef.current?.();
      if (formatTimerRef.current) {
        clearTimeout(formatTimerRef.current);
      }
    };
  }, []);

  const loadClarificationFromStatus = useCallback(
    async (targetRequestId: string) => {
      const token = await getAccessToken();
      const status = await getAgentRunStatus(projectId, targetRequestId, token);

      if (status.status === "waiting_for_clarification") {
        if (!isClarificationAnswered(projectId, targetRequestId)) {
          setClarification(status.pending_clarification as ClarificationPayload);
        }
        setIsRunning(false);
        return;
      }

      setClarification(null);
      setIsRunning(status.status === "running" || status.status === "queued");
    },
    [projectId]
  );

  const applyCanvasEvent = useCallback(
    (event: AgentStreamEvent) => {
      const payload = event.payload as Record<string, unknown>;
      const scheduleFormatFlow = () => {
        if (formatTimerRef.current) {
          clearTimeout(formatTimerRef.current);
        }
        formatTimerRef.current = setTimeout(() => {
          withSilentFlowUpdate(() => {
            void formatFlow();
          });
          formatTimerRef.current = null;
        }, 80);
      };

      if (event.type === "node_upserted" || event.type === "node_patched") {
        const node = payload.node as Node | undefined;
        if (!node?.id) return;
        const currentNodes = useFlowStore.getState().nodes;
        withSilentFlowUpdate(() => {
          setNodes(
            event.type === "node_patched"
              ? patchNode(currentNodes, node)
              : upsertNode(currentNodes, node)
          );
        });
        scheduleFormatFlow();
        return;
      }

      if (event.type === "node_removed") {
        const nodeId = String(payload.step_id || payload.node_id || payload.id || "");
        if (!nodeId) return;
        const { nodes: currentNodes, edges: currentEdges } = useFlowStore.getState();
        withSilentFlowUpdate(() => {
          setNodes(currentNodes.filter((node) => node.id !== nodeId));
          setEdges(
            currentEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
          );
        });
        scheduleFormatFlow();
        return;
      }

      if (event.type === "edge_upserted") {
        const edge = payload.edge as Edge | undefined;
        if (!edge?.id) return;
        const currentEdges = useFlowStore.getState().edges;
        withSilentFlowUpdate(() => {
          setEdges(upsertEdge(currentEdges, edge));
        });
        scheduleFormatFlow();
        return;
      }

      if (event.type === "flow_replaced") {
        const flow = (payload.flow || payload.flow_json || payload) as {
          nodes?: Node[];
          edges?: Edge[];
        };
        withSilentFlowUpdate(() => {
          if (Array.isArray(flow.nodes)) {
            setNodes(flow.nodes);
          }
          if (Array.isArray(flow.edges)) {
            setEdges(flow.edges);
          }
        });
        scheduleFormatFlow();
      }
    },
    [formatFlow, setEdges, setNodes, withSilentFlowUpdate]
  );

  const handleStreamEvent = useCallback(
    (event: AgentStreamEvent) => {
      if (event.type === "heartbeat") return;
      if (activeRequestIdRef.current && event.request_id !== activeRequestIdRef.current) {
        return;
      }
      if (event.seq <= processedSeqRef.current) return;
      processedSeqRef.current = event.seq;

      const payload = (event.payload || {}) as Record<string, unknown>;
      const description =
        event.description ||
        (typeof payload.description === "string" ? payload.description : "");

      if (description && shouldRenderActivityDescription(event.type)) {
        appendActivityMessage(setMessages, event.request_id, {
          id: `${event.request_id}-${event.seq}-activity`,
          content: description,
          eventType: event.type,
        });
      }

      if (
        event.type === "node_upserted" ||
        event.type === "node_patched" ||
        event.type === "node_removed" ||
        event.type === "edge_upserted" ||
        event.type === "flow_replaced"
      ) {
        applyCanvasEvent(event);
        return;
      }

      if (event.type === "run_started") {
        setIsRunning(true);
        setStreamError(null);
        return;
      }

      if (event.type === "plan_created") {
        const items = normalizePlanItems(payload);
        setPlanItems(items);
        upsertPlanMessage(setMessages, event.request_id, items, true);
        return;
      }

      if (event.type === "plan_item_updated") {
        const [item] = normalizePlanItems({ items: [payload.item || payload] });
        if (item) {
          setPlanItems((current) => {
            const next = upsertById(current, item);
            upsertPlanMessage(setMessages, event.request_id, next, true);
            return next;
          });
        }
        return;
      }

      if (event.type === "plan_completed") {
        setPlanItems((current) => {
          const next = current.map((item) => ({ ...item, status: "done" as const }));
          upsertPlanMessage(setMessages, event.request_id, next, false);
          return next;
        });
        return;
      }

      if (event.type === "tool_call") {
        return;
      }

      if (event.type === "tool_result") {
        return;
      }

      if (event.type === "clarification_required") {
        if (isClarificationAnswered(projectId, event.request_id)) {
          return;
        }
        void loadClarificationFromStatus(event.request_id).catch(() => {
          setClarification(event.payload as ClarificationPayload);
          setIsRunning(false);
        });
        return;
      }

      if (event.type === "assistant_message") {
        const content = String(payload.content || payload.message || "");
        if (content) {
          appendMessageUnique(setMessages, {
            id: `${event.request_id}-${event.seq}-assistant`,
            role: "assistant",
            content,
          });
        }
        return;
      }

      if (event.type === "run_completed") {
        const content = String(payload.final_response || payload.message || "Agent ishni yakunladi");
        appendMessageUnique(setMessages, {
          id: `${event.request_id}-${event.seq}-completed`,
          role: "assistant",
          content,
        });
        setIsRunning(false);
        cleanupRef.current?.();
        cleanupRef.current = null;
        return;
      }

      if (event.type === "run_failed") {
        const content = String(payload.error || payload.message || "Agent run xatolik bilan tugadi");
        appendMessageUnique(setMessages, {
          id: `${event.request_id}-${event.seq}-failed`,
          role: "system",
          content,
        });
        setStreamError(content);
        setIsRunning(false);
        cleanupRef.current?.();
        cleanupRef.current = null;
      }
    },
    [applyCanvasEvent, loadClarificationFromStatus, projectId]
  );

  const startStream = useCallback(
    async (nextRequestId: string, token: string) => {
      cleanupRef.current?.();
      activeRequestIdRef.current = nextRequestId;
      cleanupRef.current = createAgentEventStream({
        projectId,
        requestId: nextRequestId,
        token,
        onEvent: handleStreamEvent,
        onError: (error) => {
          setStreamError(error.message);
          setIsRunning(false);
        },
        onClose: () => {
          if (activeRequestIdRef.current !== nextRequestId) {
            return;
          }

          void (async () => {
            try {
              const status = await getAgentRunStatus(projectId, nextRequestId, token);
              if (activeRequestIdRef.current !== nextRequestId) {
                return;
              }

              if (status.status === "completed") {
                if (status.final_response) {
                  appendMessageUnique(setMessages, {
                    id: `${nextRequestId}-status-completed`,
                    role: "assistant",
                    content: status.final_response,
                  });
                }
                setIsRunning(false);
                setClarification(null);
                cleanupRef.current = null;
                return;
              }

              if (status.status === "failed") {
                const content = status.error || "Agent run xatolik bilan tugadi";
                appendMessageUnique(setMessages, {
                  id: `${nextRequestId}-status-failed`,
                  role: "system",
                  content,
                });
                setStreamError(content);
                setIsRunning(false);
                cleanupRef.current = null;
                return;
              }

              if (status.status === "waiting_for_clarification") {
                if (!isClarificationAnswered(projectId, nextRequestId)) {
                  setClarification(status.pending_clarification as ClarificationPayload);
                }
                setIsRunning(false);
                cleanupRef.current = null;
                return;
              }

              setIsRunning(status.status === "running" || status.status === "queued");
            } catch {
              if (activeRequestIdRef.current === nextRequestId) {
                setIsRunning(false);
              }
            }
          })();
        },
      });
    },
    [handleStreamEvent, projectId]
  );

  const handleSubmit = useCallback(async () => {
    const text = prompt.trim();
    if (!text || isRunning) return;

    setPrompt("");
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: "user", content: text },
    ]);
    setPlanItems([]);
    setClarification(null);
    setStreamError(null);
    setIsRunning(true);
    cleanupRef.current?.();
    cleanupRef.current = null;
    activeRequestIdRef.current = null;
    processedSeqRef.current = 0;

    try {
      const token = await getAccessToken();
      const run = await createAgentRun(
        projectId,
        {
          prompt: text,
        },
        token
      );
      clearClarificationAnswered(projectId, run.request_id);
      setRequestId(run.request_id);
      await startStream(run.request_id, token);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Agent run yaratilmadi";
      setStreamError(message);
      setIsRunning(false);
      toast.error(message);
    }
  }, [isRunning, projectId, prompt, startStream]);

  const handleClarify = useCallback(
    async (answer: ClarifyRequest) => {
      if (!requestId) return;
      setClarification(null);
      setIsRunning(true);
      try {
        const token = await getAccessToken();
        await answerAgentClarification(projectId, requestId, answer, token);
        markClarificationAnswered(projectId, requestId);
        await startStream(requestId, token);
      } catch (error) {
        setIsRunning(false);
        toast.error(error instanceof Error ? error.message : "Javob yuborilmadi");
      }
    },
    [projectId, requestId, startStream]
  );

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    (async () => {
      try {
        const token = await getAccessToken();
        const [history, activeRuns] = await Promise.all([
          getProjectAgentMessages(projectId, token),
          getActiveAgentRuns(projectId, token, {
            includeEvents: true,
            eventLimit: 50,
          }),
        ]);
        if (cancelled) return;

        setMessages(
          history
            .filter(isRenderableHistoryMessage)
            .map((message) => ({
              id: String(message.id),
              role: message.role,
              content: message.content,
              createdAt: message.created_at,
            }))
        );

        const [activeRun] = sortActiveRuns(activeRuns);
        if (!activeRun) {
          return;
        }

        cleanupRef.current?.();
        cleanupRef.current = null;
        activeRequestIdRef.current = activeRun.request_id;
        processedSeqRef.current = 0;
        setRequestId(activeRun.request_id);
        setStreamError(null);
        setClarification(
          activeRun.status === "waiting_for_clarification" &&
            !isClarificationAnswered(projectId, activeRun.request_id)
            ? (activeRun.pending_clarification as ClarificationPayload)
            : null
        );
        const restoredPlanItems =
          activeRun.current_plan && typeof activeRun.current_plan === "object"
            ? normalizePlanItems(activeRun.current_plan as Record<string, unknown>)
            : [];
        setPlanItems(restoredPlanItems);
        setIsRunning(activeRun.status === "running" || activeRun.status === "queued");

        const events = [...(activeRun.events || [])].sort((a, b) => a.seq - b.seq);
        events.forEach(handleStreamEvent);
        if (
          restoredPlanItems.length &&
          !events.some((event) => event.type.startsWith("plan_"))
        ) {
          upsertPlanMessage(
            setMessages,
            activeRun.request_id,
            restoredPlanItems,
            activeRun.status === "running" || activeRun.status === "queued"
          );
        }
        processedSeqRef.current = Math.max(
          processedSeqRef.current,
          activeRun.last_event_seq || 0
        );

        if (activeRun.status === "running" || activeRun.status === "queued") {
          await startStream(activeRun.request_id, token);
        }
      } catch {
        if (!cancelled) {
          toast.error("Agent active progress yuklanmadi");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handleStreamEvent, open, projectId, startStream]);

  return (
    <aside
      className={cn(
        "h-full shrink-0 overflow-hidden border-l border-border bg-background transition-all duration-200",
        open ? "w-full md:w-[420px]" : "w-0 border-l-0"
      )}
    >
      {open ? (
        <div className="flex h-full w-full flex-col">
          <div className="flex h-[62px] shrink-0 items-center gap-3 border-b border-border px-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold">Flow Agent</h2>
              <p className="text-xs text-muted-foreground">
                Project run stream orqali ishlaydi
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-4 p-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {clarification ? (
                <ClarificationCard payload={clarification} onSubmit={handleClarify} />
              ) : null}

              {streamError ? (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                  <AgentMarkdown content={streamError} />
                </div>
              ) : null}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="shrink-0 border-t border-border p-3">
            <div className="rounded-2xl border bg-muted/30 p-2">
              <Textarea
                value={prompt}
                disabled={isRunning}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
                placeholder="Agentga nima qurishini yozing..."
                className="min-h-20 resize-none border-0 bg-transparent focus-visible:ring-0"
              />
              <div className="flex items-center justify-between px-1 pb-1">
                <span className="text-xs text-muted-foreground">
                  Enter yuboradi, Shift+Enter yangi qator
                </span>
                <Button
                  size="sm"
                  className="gap-2"
                  disabled={!prompt.trim() || isRunning}
                  onClick={() => void handleSubmit()}
                >
                  {isRunning ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Yuborish
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function PlanTracker({ items, running }: { items: PlanItem[]; running: boolean }) {
  const doneCount = items.filter((item) => item.status === "done").length;

  return (
    <section className="rounded-2xl border bg-card p-3">
      <div className="mb-3 flex items-center gap-2">
        <Bot className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Plan</h3>
        {running ? (
          <Badge variant="outline" className="ml-auto">
            Running
          </Badge>
        ) : null}
      </div>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-2 text-sm">
              {item.status === "done" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
              ) : item.status === "running" ? (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" />
              ) : item.status === "error" ? (
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              ) : (
                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
              )}
              <span
                className={cn(
                  "min-w-0 flex-1",
                  item.status === "done" && "text-muted-foreground line-through"
                )}
              >
                {item.title}
              </span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">
            {doneCount}/{items.length} bajarildi
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Run boshlanganda plan bosqichlari shu yerda ko‘rinadi.
        </p>
      )}
    </section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "plan") {
    return (
      <PlanTracker
        items={message.planItems || []}
        running={Boolean(message.planRunning)}
      />
    );
  }

  if (message.role === "activity-group") {
    return <ActivityGroup activities={message.activities || []} />;
  }

  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isUser
            ? "rounded-tr-sm bg-primary text-primary-foreground"
            : message.role === "system"
              ? "border border-red-500/20 bg-red-500/10 text-red-300"
              : "rounded-tl-sm border bg-card"
        )}
      >
        <AgentMarkdown content={message.content} />
      </div>
    </div>
  );
}

function ActivityGroup({
  activities,
}: {
  activities: Array<{ id: string; content: string; eventType?: string }>;
}) {
  const [expanded, setExpanded] = useState(false);
  const latest = activities[activities.length - 1];

  if (!latest) return null;

  return (
    <section className="rounded-xl bg-muted/15 p-2.5">
      <button
        type="button"
        className="flex w-full items-start gap-2 text-left"
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="min-w-0 flex-1">
          <ActivityLine
            content={latest.content}
            eventType={latest.eventType}
            compact
          />
        </div>
        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
          {activities.length}
        </Badge>
        <ChevronDown
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded ? (
        <div className="mt-2 space-y-2 border-t pt-2">
          {activities.map((activity) => (
            <ActivityLine
              key={activity.id}
              content={activity.content}
              eventType={activity.eventType}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function getActivityMeta(eventType?: string) {
  if (eventType?.startsWith("node_")) {
    return {
      icon: Pencil,
      dotClass: "bg-sky-500",
      textClass: "text-sky-700 dark:text-sky-300",
    };
  }

  if (eventType?.startsWith("edge_") || eventType === "flow_replaced") {
    return {
      icon: GitBranch,
      dotClass: "bg-emerald-500",
      textClass: "text-emerald-700 dark:text-emerald-300",
    };
  }

  if (eventType?.startsWith("plan_")) {
    return {
      icon: CheckCircle2,
      dotClass: "bg-primary",
      textClass: "text-primary",
    };
  }

  if (eventType === "clarification_required") {
    return {
      icon: MessageCircleQuestion,
      dotClass: "bg-amber-500",
      textClass: "text-amber-700 dark:text-amber-300",
    };
  }

  if (eventType === "run_failed") {
    return {
      icon: AlertTriangle,
      dotClass: "bg-red-500",
      textClass: "text-red-700 dark:text-red-300",
    };
  }

  return {
    icon: Sparkles,
    dotClass: "bg-muted-foreground/45",
    textClass: "text-muted-foreground",
  };
}

function ActivityLine({
  content,
  eventType,
  compact,
}: {
  content: string;
  eventType?: string;
  compact?: boolean;
}) {
  const meta = getActivityMeta(eventType);
  const Icon = meta.icon;

  return (
    <div className={cn("flex items-start gap-2 text-xs", !compact && "px-1", meta.textClass)}>
      <span className={cn("mt-2 h-1.5 w-1.5 shrink-0 rounded-full", meta.dotClass)} />
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-80" />
      <div
        className={cn(
          "min-w-0 flex-1 leading-5 text-muted-foreground",
          compact && "line-clamp-2"
        )}
      >
        <AgentMarkdown content={content} />
      </div>
    </div>
  );
}

function AgentMarkdown({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ children, href }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2"
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code className="rounded bg-muted px-1 py-0.5 text-[0.85em]">
            {children}
          </code>
        ),
        pre: ({ children }) => (
          <pre className="my-2 overflow-x-auto rounded-lg bg-muted p-2 text-xs">
            {children}
          </pre>
        ),
        ul: ({ children }) => <ul className="my-1 list-disc space-y-1 pl-4">{children}</ul>,
        ol: ({ children }) => <ol className="my-1 list-decimal space-y-1 pl-4">{children}</ol>,
        p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function ClarificationCard({
  payload,
  onSubmit,
}: {
  payload: ClarificationPayload;
  onSubmit: (answer: ClarifyRequest) => void;
}) {
  const questions = "questions" in payload ? payload.questions : [payload];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [freeText, setFreeText] = useState<Record<string, string>>({});
  const currentQuestion = questions[currentIndex];
  const currentQuestionId = currentQuestion?.id || `question-${currentIndex}`;
  const currentSelected = answers[currentQuestionId] || [];
  const currentFreeText = freeText[currentQuestionId]?.trim() || "";
  const hasCurrentAnswer = Boolean(currentFreeText || currentSelected.length);
  const isLastQuestion = currentIndex >= questions.length - 1;

  const setSingle = (questionId: string, value: string) => {
    setAnswers((current) => ({ ...current, [questionId]: [value] }));
  };

  const toggleMultiple = (questionId: string, value: string) => {
    setAnswers((current) => {
      const values = current[questionId] || [];
      return {
        ...current,
        [questionId]: values.includes(value)
          ? values.filter((item) => item !== value)
          : [...values, value],
      };
    });
  };

  const getAnswerText = (question: ClarificationQuestion, questionId: string) => {
    const selected = answers[questionId] || [];
    return (
      freeText[questionId]?.trim() ||
      selected
        .map((id) =>
          getOptionLabel(
            question.options?.find((option) => getOptionId(option) === id) || {}
          )
        )
        .filter(Boolean)
        .join(", ")
    );
  };

  const handleSubmit = () => {
    const normalized = questions.map((question, index) => {
      const questionId = question.id || `question-${index}`;
      const selected = answers[questionId] || [];
      const answerText = getAnswerText(question, questionId);

      if (question.selection_type === "multiple") {
        return {
          question_id: questionId,
          answer: answerText,
          option_ids: selected,
        };
      }

      return {
        question_id: questionId,
        answer: answerText,
        option_id: selected[0],
      };
    });

    if (questions.length > 1) {
      onSubmit({ answer: "batch", answers: normalized });
      return;
    }

    const [single] = normalized;
    onSubmit({
      answer: single.answer,
      option_id: single.option_id,
      option_ids: single.option_ids,
    });
  };

  if (!currentQuestion) {
    return null;
  }

  const options = currentQuestion.options || [];

  return (
    <section className="rounded-2xl border border-primary/20 bg-primary/5 p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Aniqlashtirish kerak</h3>
        <Badge variant="outline" className="text-[10px]">
          {currentIndex + 1}/{questions.length}
        </Badge>
      </div>
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">{currentQuestion.question}</p>
          {currentQuestion.details ? (
            <p className="text-xs text-muted-foreground">{currentQuestion.details}</p>
          ) : null}
        </div>

        {currentQuestion.selection_type === "multiple" ? (
          <div className="space-y-2">
            {options.map((option) => {
              const optionId = getOptionId(option);
              return (
                <label key={optionId} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={currentSelected.includes(optionId)}
                    onCheckedChange={() => toggleMultiple(currentQuestionId, optionId)}
                  />
                  {getOptionLabel(option)}
                </label>
              );
            })}
          </div>
        ) : (
          <RadioGroup
            value={currentSelected[0] || ""}
            onValueChange={(value) => setSingle(currentQuestionId, value)}
          >
            {options.map((option) => {
              const optionId = getOptionId(option);
              return (
                <label key={optionId} className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value={optionId} />
                  {getOptionLabel(option)}
                </label>
              );
            })}
          </RadioGroup>
        )}

        {currentQuestion.allow_free_text ? (
          <Textarea
            placeholder="Boshqa javob..."
            value={freeText[currentQuestionId] || ""}
            onChange={(event) =>
              setFreeText((current) => ({
                ...current,
                [currentQuestionId]: event.target.value,
              }))
            }
          />
        ) : null}

        {questions.length > 1 ? (
          <div className="flex gap-1.5">
            {questions.map((question, index) => {
              const questionId = question.id || `question-${index}`;
              const answered = Boolean(getAnswerText(question, questionId));
              return (
                <span
                  key={questionId}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    index === currentIndex
                      ? "bg-primary"
                      : answered
                        ? "bg-primary/45"
                        : "bg-muted"
                  )}
                />
              );
            })}
          </div>
        ) : null}

        <div className="flex gap-2">
          {questions.length > 1 ? (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
            >
              Orqaga
            </Button>
          ) : null}
          <Button
            type="button"
            className="flex-1"
            disabled={!hasCurrentAnswer}
            onClick={() => {
              if (isLastQuestion) {
                handleSubmit();
                return;
              }
              setCurrentIndex((index) => Math.min(questions.length - 1, index + 1));
            }}
          >
            {isLastQuestion ? "Javoblarni yuborish" : "Keyingi savol"}
          </Button>
        </div>
      </div>
    </section>
  );
}
