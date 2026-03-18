"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { getSession } from "next-auth/react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  getProjectSession,
  wsChatWithAgent,
  type AgentMessage,
  type StreamEvent,
} from "@/services/requests/agent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot, Send, Loader2, ChevronLeft, RotateCcw,
  CheckCircle2, Sparkles, Search, Database, Terminal,
  Globe, Users, Settings, Package, FileText, Zap, Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Tool config ───────────────────────────────────────────────────────────

type ToolCat = "plugin" | "cms" | "debug" | "deploy" | "project" | "users" | "other";

const TOOL_CFG: Record<string, { label: string; cat: ToolCat }> = {
  search_plugins:           { label: "Plugin qidirish",          cat: "plugin"  },
  get_plugin:               { label: "Plugin schema",             cat: "plugin"  },
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

interface Message extends AgentMessage { id: string }

interface Step {
  key: string;
  name: string;
  status: "running" | "done" | "error";
  preview?: string;
}

interface AgentPanelProps {
  projectId: string;
  onCollapse: () => void;
  initialPrompt?: string;
  onBuildingChange?: (isBuilding: boolean) => void;
}

// ── Component ─────────────────────────────────────────────────────────────

export function AgentPanel({ projectId, onCollapse, initialPrompt, onBuildingChange }: AgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFlow, setHasFlow] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [steps, setSteps] = useState<Step[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stepsRef = useRef<Step[]>([]);
  const wsCleanupRef = useRef<(() => void) | null>(null);
  const initialPromptSentRef = useRef(false);

  const { setNodes, setEdges, formatFlow } = useFlowStore();

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

  const applyFlow = useCallback((flow: { nodes: any[]; edges: any[] }) => {
    setNodes(flow.nodes || []);
    setEdges(flow.edges || []);
    setTimeout(() => formatFlow(), 50);
  }, [setNodes, setEdges, formatFlow]);

  const resetStream = () => {
    stepsRef.current = [];
    setSteps([]);
  };

  const sendMessage = useCallback(async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isLoading || isInitializing) return;

    if (!textOverride) {
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    resetStream();

    // Get auth token
    const session = await getSession();
    const token = (session?.user as any)?.access ?? "";

    const cleanup = wsChatWithAgent(projectId, text, token, (event: StreamEvent) => {
      if (event.type === "tool_call") {
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
        toast.error(event.message || "Xatolik yuz berdi");
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitializing]);

  // Cleanup WebSocket on unmount
  useEffect(() => () => { wsCleanupRef.current?.(); }, []);

  return (
    <div className="flex flex-col h-full bg-background w-full">

      {/* Header */}
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
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={onCollapse}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-2 p-3">
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
                  <div className="flex-1 min-w-0 space-y-1">
                    {steps.length > 0 ? (
                      <div className="rounded-xl border border-border overflow-hidden bg-card">
                        {steps.map(step => (
                          <StepRow key={step.key} step={step} />
                        ))}
                      </div>
                    ) : (
                      <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 w-fit">
                        <div className="flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    )}
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
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex gap-2 items-start">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
        <Bot className="h-3 w-3" />
      </div>
      <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed">
        <FormattedMessage text={message.content} />
      </div>
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
