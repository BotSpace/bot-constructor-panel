"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  getProjectSession,
  wsChatWithAgent,
  type AgentMessage,
  type StreamEvent,
  type TaskItem,
} from "@/services/requests/agent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot, Send, Loader2, ChevronLeft, RotateCcw,
  CheckCircle2, Sparkles, Search, Database, Terminal,
  Globe, Users, Settings, Package, FileText, Zap, Wrench, Map, Circle,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Tool config ───────────────────────────────────────────────────────────

type ToolCat = "plugin" | "cms" | "debug" | "deploy" | "project" | "users" | "other";

const TOOL_CFG: Record<string, { label: string; cat: ToolCat }> = {
  search_plugins:           { label: "Plugin qidirish",          cat: "plugin"  },
  get_plugin:               { label: "Plugin schema",             cat: "plugin"  },
  validate_plugin_params:   { label: "Plugin parametrlari",       cat: "plugin"  },
  list_categories:          { label: "Kategoriyalar ro'yxati",    cat: "plugin"  },
  list_collections:         { label: "Kolleksiyalar ro'yxati",    cat: "cms"     },
  get_collection:           { label: "Kolleksiya ma'lumoti",      cat: "cms"     },
  create_collection:        { label: "Kolleksiya yaratish",       cat: "cms"     },
  update_collection_fields: { label: "Kolleksiya yangilash",      cat: "cms"     },
  delete_collection:        { label: "Kolleksiya o'chirish",      cat: "cms"     },
  query_collection:         { label: "Ma'lumot so'rovi",          cat: "cms"     },
  get_project_info:         { label: "Loyiha ma'lumoti",          cat: "project" },
  update_project:           { label: "Loyiha yangilash",          cat: "project" },
  get_resource_usage:       { label: "Resurs holati",             cat: "project" },
  start_debug_bot:          { label: "Debug bot ishga tushirish", cat: "debug"   },
  stop_debug_bot:           { label: "Debug bot to'xtatish",      cat: "debug"   },
  get_debug_container_info: { label: "Container ma'lumoti",       cat: "debug"   },
  get_logs:                 { label: "Loglar o'qilyapti",         cat: "debug"   },
  list_releases:            { label: "Relizlar ro'yxati",         cat: "deploy"  },
  create_release:           { label: "Reliz yaratish",            cat: "deploy"  },
  stop_release:             { label: "Reliz to'xtatish",          cat: "deploy"  },
  list_env_vars:            { label: "Env o'zgaruvchilar",        cat: "project" },
  set_env_var:              { label: "Env saqlash",               cat: "project" },
  delete_env_var:           { label: "Env o'chirish",             cat: "project" },
  get_chat_stats:           { label: "Chat statistikasi",         cat: "users"   },
  get_bot_users:            { label: "Bot foydalanuvchilari",     cat: "users"   },
  get_user_messages:        { label: "Foydalanuvchi xabarlari",   cat: "users"   },
  send_message_to_user:     { label: "Xabar yuborish",            cat: "users"   },
};

const CAT_STYLE: Record<ToolCat, { dot: string; icon: string; bg: string; Icon: React.ElementType }> = {
  plugin:  { dot: "bg-blue-500",    icon: "text-blue-500",    bg: "bg-blue-500/10",    Icon: Package  },
  cms:     { dot: "bg-violet-500",  icon: "text-violet-500",  bg: "bg-violet-500/10",  Icon: Database },
  debug:   { dot: "bg-orange-500",  icon: "text-orange-500",  bg: "bg-orange-500/10",  Icon: Terminal },
  deploy:  { dot: "bg-emerald-500", icon: "text-emerald-500", bg: "bg-emerald-500/10", Icon: Globe    },
  project: { dot: "bg-sky-500",     icon: "text-sky-500",     bg: "bg-sky-500/10",     Icon: Settings },
  users:   { dot: "bg-pink-500",    icon: "text-pink-500",    bg: "bg-pink-500/10",    Icon: Users    },
  other:   { dot: "bg-gray-400",    icon: "text-gray-400",    bg: "bg-gray-400/10",    Icon: Wrench   },
};

function toolCfg(name: string) {
  return TOOL_CFG[name] ?? { label: name, cat: "other" as ToolCat };
}

// ── Types ─────────────────────────────────────────────────────────────────

interface Step {
  key: string;
  name: string;
  status: "running" | "done" | "error";
  preview?: string;
}

interface Message extends AgentMessage {
  id: string;
  plan?: string;
  steps?: Step[];
  tasks?: TaskItem[];
}

interface AgentPanelProps {
  projectId: string;
  onCollapse?: () => void;
  initialPrompt?: string;
  onBuildingChange?: (isBuilding: boolean) => void;
  hideHeader?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────

export function AgentPanel({ projectId, onCollapse, initialPrompt, onBuildingChange, hideHeader }: AgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFlow, setHasFlow] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [shouldResume, setShouldResume] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [planContent, setPlanContent] = useState<string | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stepsRef = useRef<Step[]>([]);
  const planRef = useRef<string | null>(null);
  const tasksRef = useRef<TaskItem[]>([]);
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const initialPromptSentRef = useRef(false);

  const { setNodes, setEdges, formatFlow } = useFlowStore();
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, steps]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsInitializing(true);
      try {
        const data = await getProjectSession(projectId);
        if (cancelled) return;
        setHasFlow(data.has_flow);
        setMessages(
          data.messages.length > 0
            ? data.messages.map((m, i) => ({ ...m, id: String(i) }))
            : [{ id: "w", role: "assistant", content: "Salom! 👋 Men Botmother AI agentiman.\n\nQanday Telegram bot yaratishni xohlaysiz? Tafsilot bering — hoziroq flow yarataman." }]
        );
        // Agent was running when the page was refreshed — reconnect to get the result
        if (data.phase === "running") {
          setShouldResume(true);
        }
      } catch {
        if (!cancelled) setMessages([{ id: "e", role: "assistant", content: "Ulanishda xatolik. Sahifani yangilang." }]);
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  // Resume after page refresh: WS reconnect with empty message
  useEffect(() => {
    if (!shouldResume || isInitializing) return;
    setShouldResume(false);
    setIsLoading(true);
    (async () => {
      const session = await getSession();
      const token = (session?.user as any)?.access ?? "";
      const cleanup = wsChatWithAgent(projectId, "", token, (event: StreamEvent) => {
        if (event.type === "done") {
          resetStream();
          onBuildingChange?.(false);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: event.reply,
          }]);
          setHasFlow(event.has_flow);
          if (event.flow_json) {
            setPendingFlow(event.flow_json);
            applyFlow(event.flow_json);
            toast.success(`Flow qo'llandi — ${event.flow_json.nodes?.length ?? 0} ta node`);
          }
          setIsLoading(false);
        } else if (event.type === "error") {
          resetStream();
          onBuildingChange?.(false);
          setIsLoading(false);
        }
      });
      wsCleanupRef.current = cleanup;
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldResume, isInitializing]);

  const applyFlow = useCallback((flow: { nodes: any[]; edges: any[] }) => {
    // Compare incoming nodes with current to detect added vs modified
    const { nodes: prevNodes } = useFlowStore.getState();
    const prevMap: Record<string, any> = {};
    prevNodes.forEach(n => { prevMap[n.id] = n; });

    const annotated = (flow.nodes || []).map((node: any) => {
      if (!prevMap[node.id]) return { ...node, className: "ai-node-added" };
      if (JSON.stringify(prevMap[node.id].data) !== JSON.stringify(node.data))
        return { ...node, className: "ai-node-modified" };
      return node;
    });

    const highlighted = new Set(annotated.filter((n: any) => n.className).map((n: any) => n.id));

    setNodes(annotated);
    setEdges(flow.edges || []);
    setTimeout(() => formatFlow(), 50);

    // Clear highlights after 5s
    if (highlighted.size > 0) {
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      highlightTimeoutRef.current = setTimeout(() => {
        const { nodes: cur } = useFlowStore.getState();
        setNodes(cur.map(n => highlighted.has(n.id) ? { ...n, className: undefined } : n));
      }, 5000);
    }
  }, [setNodes, setEdges, formatFlow]);

  const resetStream = () => {
    stepsRef.current = [];
    planRef.current = null;
    tasksRef.current = [];
    setSteps([]);
    setPlanContent(null);
    setTasks([]);
  };

  const sendMessage = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading || isInitializing) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    resetStream();

    const session = await getSession();
    const token = (session?.user as any)?.access ?? "";

    const cleanup = wsChatWithAgent(projectId, text, token, (event: StreamEvent) => {
      if (event.type === "ping" || event.type === "node") {
        // heartbeat / graph node transition — ignore

      } else if (event.type === "plan") {
        planRef.current = event.content;
        setPlanContent(event.content);

      } else if (event.type === "tasks_plan") {
        // Full task list received — show progress tracker
        tasksRef.current = event.tasks;
        setTasks([...event.tasks]);

      } else if (event.type === "task_start") {
        // Mark specific task as running
        const updated = tasksRef.current.map(t =>
          t.index === event.index ? { ...t, status: "running" as const } : t
        );
        tasksRef.current = updated;
        setTasks([...updated]);

      } else if (event.type === "task_done") {
        // Mark specific task as done
        const updated = tasksRef.current.map(t =>
          t.index === event.index ? { ...t, status: "done" as const } : t
        );
        tasksRef.current = updated;
        setTasks([...updated]);

      } else if (event.type === "tasks_complete") {
        toast.success(event.message || "Barcha bosqichlar tayyor!");

      } else if (event.type === "setup") {
        // Collections created / debug bot started — show as toast
        if (event.content) toast.success(event.content, { duration: 4000 });

      } else if (event.type === "flow_update") {
        applyFlow(event.flow_json);
        setPendingFlow(event.flow_json);

      } else if (event.type === "tool_call") {
        const step: Step = {
          key: `${event.name}-${Date.now()}`,
          name: event.name,
          status: "running",
          preview: event.input,
        };
        stepsRef.current = [...stepsRef.current, step];
        setSteps([...stepsRef.current]);

      } else if (event.type === "tool_result") {
        const updated = stepsRef.current.map(s =>
          s.name === event.name && s.status === "running"
            ? { ...s, status: "done" as const, preview: event.preview }
            : s
        );
        stepsRef.current = updated;
        setSteps([...updated]);

      } else if (event.type === "done") {
        // Agent finished entire build (all modules done internally)
        const savedPlan = planRef.current || undefined;
        const savedSteps = stepsRef.current.filter(s => s.status === "done");
        const savedTasks = tasksRef.current.length >= 2 ? [...tasksRef.current] : undefined;
        resetStream();
        onBuildingChange?.(false);
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: event.reply,
          plan: savedPlan,
          steps: savedSteps.length > 0 ? savedSteps : undefined,
          tasks: savedTasks,
        }]);
        setHasFlow(event.has_flow);
        if (event.flow_json) {
          setPendingFlow(event.flow_json);
          applyFlow(event.flow_json);
          toast.success(`Flow qo'llandi — ${event.flow_json.nodes?.length ?? 0} ta node`);
        }
        setIsLoading(false);

      } else if (event.type === "error") {
        resetStream();
        onBuildingChange?.(false);
        toast.error(event.message || "Xatolik yuz berdi");
        if (userMsg) setMessages(prev => prev.filter(m => m.id !== userMsg!.id));
        setIsLoading(false);
      }
    });

    wsCleanupRef.current = cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isLoading, isInitializing, projectId, applyFlow]);

  // Auto-send initialPrompt once after initialization (no prior messages)
  useEffect(() => {
    if (!isInitializing && initialPrompt && !initialPromptSentRef.current && messages.length <= 1) {
      initialPromptSentRef.current = true;
      onBuildingChange?.(true);
      sendMessage(initialPrompt);
      // Remove ?prompt= from URL so page refresh doesn't re-trigger
      const url = new URL(window.location.href);
      url.searchParams.delete("prompt");
      window.history.replaceState(null, "", url.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing]);

  // Cleanup on unmount
  useEffect(() => () => {
    wsCleanupRef.current?.();
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
  }, []);

  return (
    <div className="flex flex-col h-full bg-background w-full">

      {/* Header */}
      {!hideHeader && (
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-semibold flex-1">AI Agent</span>
          <div className="flex items-center gap-2 shrink-0">
            {hasFlow && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span className="text-xs">Tayyor</span>
              </div>
            )}
            {onCollapse && (
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onCollapse}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 p-4">
          {isInitializing ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" /> Yuklanmoqda...
            </div>
          ) : (
            <>
              {messages.map(msg => <MessageBubble key={msg.id} message={msg} />)}

              {/* Live activity */}
              {isLoading && (
                <div className="flex gap-2 items-start">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Plan card — shown while agent is planning */}
                    {planContent && <PlanCard content={planContent} />}

                    {/* Task progress — shown during multi-module builds */}
                    {tasks.length >= 2 && (
                      <TaskProgressCard tasks={tasks} isBuilding />
                    )}

                    {steps.length > 0 ? (
                      <div className="rounded-xl border border-border overflow-hidden bg-card">
                        {steps.map(step => (
                          <StepRow key={step.key} step={step} />
                        ))}
                      </div>
                    ) : !planContent ? (
                      <div className="flex gap-1 items-center py-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Flow banner */}
      {pendingFlow && (
        <div className="mx-3 mb-2 rounded-lg border border-green-500/20 bg-green-500/[0.08] px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 min-w-0">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">Flow qo'llandi — {pendingFlow.nodes?.length ?? 0} ta node</span>
          </div>
          <Button size="sm" variant="ghost" onClick={() => applyFlow(pendingFlow)}
            className="h-6 px-2 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground">
            <RotateCcw className="h-3 w-3" /> Qayta
          </Button>
        </div>
      )}

      {/* Input */}
      <div className="px-3 pb-3 pt-2 border-t border-border shrink-0">
        <div className="relative rounded-xl border border-border bg-muted/50 focus-within:border-primary/50 focus-within:bg-background transition-colors">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 140) + "px";
            }}
            onKeyDown={e => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Bot haqida yozing..."
            disabled={isLoading || isInitializing}
            rows={1}
            className="w-full resize-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[140px] placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center justify-between px-2 pb-2 pt-0.5">
            <span className="text-xs text-muted-foreground/40 select-none">↵ yuborish · ⇧↵ yangi qator</span>
            <Button size="icon" className="h-7 w-7 rounded-lg" onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || isInitializing}>
              {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Task progress card ─────────────────────────────────────────────────────

interface TaskProgressCardProps {
  tasks: TaskItem[];
  isBuilding?: boolean;
}

function TaskProgressCard({ tasks }: TaskProgressCardProps) {
  const doneCount = tasks.filter(t => t.status === "done").length;

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-muted/30">
        <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />
        <span className="text-xs font-medium text-foreground">Bosqichli qurilish</span>
        <span className="ml-auto text-xs text-muted-foreground">{doneCount}/{tasks.length}</span>
      </div>
      <div className="divide-y divide-border">
        {tasks.map((task) => {
          const done = task.status === "done";
          const active = task.status === "running";
          return (
            <div key={task.index} className={cn(
              "flex items-center gap-2.5 px-3 py-2 text-xs transition-colors",
              active && "bg-primary/[0.04]",
            )}>
              {done ? (
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
              ) : active ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 text-primary animate-spin" />
              ) : (
                <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/30" />
              )}
              <span className={cn(
                "flex-1 min-w-0 truncate",
                done ? "text-muted-foreground line-through" : active ? "text-foreground font-medium" : "text-muted-foreground/60",
              )}>
                {task.index + 1}. {task.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Plan card ─────────────────────────────────────────────────────────────

function PlanCard({ content }: { content: string }) {
  return (
    <div className="rounded-xl border border-primary/20 overflow-hidden bg-primary/[0.04]">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-primary/10 bg-primary/[0.06]">
        <Map className="h-3.5 w-3.5 text-primary/70 shrink-0" />
        <span className="text-xs font-medium text-primary/80">Reja</span>
        <Loader2 className="h-3 w-3 text-primary/50 animate-spin ml-auto" />
      </div>
      <div className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <FormattedMessage text={content} />
      </div>
    </div>
  );
}

// ── Step row ──────────────────────────────────────────────────────────────

function StepRow({ step }: { step: Step }) {
  const cfg = toolCfg(step.name);
  const style = CAT_STYLE[cfg.cat];
  const { Icon } = style;

  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 text-sm transition-colors",
      "border-b border-border last:border-0",
      step.status === "running" && "bg-muted/40"
    )}>
      {/* Category icon */}
      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", style.bg)}>
        <Icon className={cn("h-3.5 w-3.5", style.icon)} />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className={cn("font-medium leading-tight", step.status === "done" ? "text-muted-foreground" : "text-foreground")}>
          {cfg.label}
        </p>
        {step.status === "running" && step.preview && (
          <p className="text-xs text-muted-foreground/60 truncate mt-0.5">{step.preview}</p>
        )}
      </div>

      {/* Status */}
      {step.status === "running" ? (
        <Loader2 className="h-3.5 w-3.5 shrink-0 text-primary animate-spin" />
      ) : (
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
      )}
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const [expanded, setExpanded] = useState(false);

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  const hasActivity = message.plan || (message.steps && message.steps.length > 0) || (message.tasks && message.tasks.length >= 2);
  const doneTasks = message.tasks?.filter(t => t.status === "done").length ?? 0;

  return (
    <div className="flex gap-2 items-start">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
        <Bot className="h-3 w-3" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        {/* Collapsed activity summary */}
        {hasActivity && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-muted-foreground transition-colors"
          >
            <ChevronLeft className={cn("h-3 w-3 transition-transform", expanded ? "-rotate-90" : "rotate-180")} />
            {message.tasks && message.tasks.length >= 2 && (
              <span>{doneTasks}/{message.tasks.length} bosqich</span>
            )}
            {message.tasks && message.tasks.length >= 2 && (message.steps?.length || message.plan) && (
              <span className="text-muted-foreground/40">·</span>
            )}
            {message.steps && message.steps.length > 0 && (
              <span>{message.steps.length} ta tool</span>
            )}
            {message.plan && message.steps && message.steps.length > 0 && (
              <span className="text-muted-foreground/40">·</span>
            )}
            {message.plan && <span>Reja</span>}
          </button>
        )}

        {/* Expanded: tasks + plan + steps */}
        {hasActivity && expanded && (
          <div className="space-y-1">
            {message.tasks && message.tasks.length >= 2 && (
              <TaskProgressCard tasks={message.tasks} isBuilding={false} />
            )}
            {message.plan && (
              <div className="rounded-xl border border-primary/20 overflow-hidden bg-primary/[0.04]">
                <div className="flex items-center gap-2 px-3 py-1.5 border-b border-primary/10 bg-primary/[0.06]">
                  <Map className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                  <span className="text-xs font-medium text-primary/80">Reja</span>
                </div>
                <div className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <FormattedMessage text={message.plan} />
                </div>
              </div>
            )}
            {message.steps && message.steps.length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden bg-card">
                {message.steps.map(step => (
                  <HistoryStepRow key={step.key} step={step} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main reply */}
        <div className="text-sm leading-relaxed">
          <FormattedMessage text={message.content} />
        </div>
      </div>
    </div>
  );
}

function HistoryStepRow({ step }: { step: Step }) {
  const cfg = toolCfg(step.name);
  const style = CAT_STYLE[cfg.cat];
  const { Icon } = style;
  return (
    <div className="flex items-center gap-3 px-3 py-1.5 text-xs border-b border-border last:border-0">
      <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md", style.bg)}>
        <Icon className={cn("h-3 w-3", style.icon)} />
      </div>
      <span className="flex-1 text-muted-foreground truncate">{cfg.label}</span>
      <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
    </div>
  );
}

function FormattedMessage({ text }: { text: string }) {
  return (
    <div className="space-y-0.5">
      {text.split("\n").map((line, i) => {
        if (line.match(/^[-•*] /))
          return <div key={i} className="flex gap-1.5"><span className="text-primary/60 shrink-0">•</span><span>{applyInline(line.replace(/^[-•*] /, ""))}</span></div>;
        if (line.match(/^\d+\. /)) {
          const [num, ...rest] = line.split(". ");
          return <div key={i} className="flex gap-1.5"><span className="text-primary/60 shrink-0 font-medium">{num}.</span><span>{applyInline(rest.join(". "))}</span></div>;
        }
        return <p key={i} className={line === "" ? "h-2" : ""}>{applyInline(line)}</p>;
      })}
    </div>
  );
}

function applyInline(text: string): React.ReactNode {
  return text.split(/(\*\*?.+?\*\*?)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}
