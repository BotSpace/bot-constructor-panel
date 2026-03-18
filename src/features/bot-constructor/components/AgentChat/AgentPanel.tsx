"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  getProjectSession,
  streamChatWithAgent,
  type AgentMessage,
  type StreamEvent,
} from "@/services/requests/agent";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  Loader2,
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

interface Message extends AgentMessage {
  id: string;
}

interface LiveEvent {
  type: "tool_call" | "tool_result";
  name: string;
  detail?: string;
}

interface AgentPanelProps {
  projectId: string;
  onCollapse: () => void;
}

export function AgentPanel({ projectId, onCollapse }: AgentPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasFlow, setHasFlow] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Streaming state
  const [streamingContent, setStreamingContent] = useState("");
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { setNodes, setEdges, formatFlow } = useFlowStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, liveEvents, scrollToBottom]);

  // Load project session on mount
  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      setIsInitializing(true);
      try {
        const data = await getProjectSession(projectId);
        if (cancelled) return;
        setSessionId(data.session_id);
        setHasFlow(data.has_flow);
        if (data.messages.length > 0) {
          setMessages(data.messages.map((m, i) => ({ ...m, id: String(i) })));
        } else {
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Salom! 👋 Men Botmother AI agentiman.\n\nQanday Telegram bot yaratishni xohlaysiz? Bot haqida tafsilot bering — hoziroq flow yarataman.",
          }]);
        }
      } catch {
        if (!cancelled) {
          setMessages([{ id: "err", role: "assistant", content: "Ulanishda xatolik. Sahifani yangilang." }]);
        }
      } finally {
        if (!cancelled) {
          setIsInitializing(false);
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }
    };
    init();
    return () => { cancelled = true; };
  }, [projectId]);

  const applyFlowToCanvas = useCallback((flow: { nodes: any[]; edges: any[] }) => {
    setNodes(flow.nodes || []);
    setEdges(flow.edges || []);
    setTimeout(() => formatFlow(), 50);
  }, [setNodes, setEdges, formatFlow]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading || isInitializing) return;

    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setStreamingContent("");
    setLiveEvents([]);

    try {
      await streamChatWithAgent(projectId, text, (event: StreamEvent) => {
        if (event.type === "token") {
          setStreamingContent(prev => prev + event.content);
        } else if (event.type === "tool_call") {
          setLiveEvents(prev => [...prev, { type: "tool_call", name: event.name, detail: event.input }]);
        } else if (event.type === "tool_result") {
          setLiveEvents(prev => [...prev, { type: "tool_result", name: event.name, detail: event.preview }]);
        } else if (event.type === "done") {
          setStreamingContent("");
          setLiveEvents([]);
          setMessages(prev => [...prev, {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: event.reply,
          }]);
          setHasFlow(event.has_flow);
          if (event.flow_json) {
            setPendingFlow(event.flow_json);
            applyFlowToCanvas(event.flow_json);
            toast.success(`Flow qo'llandi — ${event.flow_json.nodes?.length ?? 0} ta node`);
          }
          setIsLoading(false);
        } else if (event.type === "error") {
          setStreamingContent("");
          setLiveEvents([]);
          toast.error(event.message || "Xatolik yuz berdi");
          setMessages(prev => prev.filter(m => m.id !== userMsg.id));
          setIsLoading(false);
        }
      });
    } catch {
      setStreamingContent("");
      setLiveEvents([]);
      toast.error("Xabar yuborishda xatolik");
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background w-full">

      {/* ── Header ── */}
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
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={onCollapse}
            title="Yopish"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Messages ── */}
      <ScrollArea className="flex-1 overflow-hidden">
        <div className="flex flex-col gap-1 p-3">
          {isInitializing ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              Yuklanmoqda...
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}

              {/* Live streaming bubble */}
              {isLoading && (
                <div className="flex gap-2 items-start mt-1">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="max-w-[88%] space-y-1.5">
                    {/* Tool event pills */}
                    {liveEvents.length > 0 && (
                      <div className="flex flex-col gap-1">
                        {liveEvents.slice(-4).map((ev, i) => (
                          <div
                            key={i}
                            className={cn(
                              "flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg",
                              ev.type === "tool_call"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            <Wrench className="h-3 w-3 shrink-0" />
                            <span className="font-mono truncate">{ev.name}</span>
                            {ev.type === "tool_result" && (
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Streaming text or typing dots */}
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm leading-relaxed">
                      {streamingContent ? (
                        <span className="whitespace-pre-wrap">
                          {streamingContent}
                          <span className="inline-block w-0.5 h-3.5 bg-current ml-0.5 animate-pulse" />
                        </span>
                      ) : (
                        <div className="flex gap-1 items-center">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* ── Flow applied banner ── */}
      {pendingFlow && (
        <div className="mx-3 mb-2 rounded-lg border border-green-500/20 bg-green-500/[0.08] px-2.5 py-1.5 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 min-w-0">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs truncate">
              Flow qo'llandi — {pendingFlow.nodes?.length ?? 0} ta node
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => applyFlowToCanvas(pendingFlow)}
            className="h-6 px-2 text-xs gap-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Qayta
          </Button>
        </div>
      )}

      {/* ── Input ── */}
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
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Bot haqida yozing..."
            disabled={isLoading || isInitializing}
            rows={1}
            className="w-full resize-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[40px] max-h-[140px] placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center justify-between px-2 pb-2 pt-0.5">
            <span className="text-xs text-muted-foreground/40 select-none">↵ yuborish · ⇧↵ yangi qator</span>
            <Button
              size="icon"
              className="h-7 w-7 rounded-lg"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading || isInitializing}
            >
              {isLoading
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Send className="h-3.5 w-3.5" />
              }
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end mt-1">
        <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-start mt-1">
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
  const lines = text.split("\n");
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) => {
        if (line.match(/^[-•*] /)) {
          return (
            <div key={i} className="flex gap-1.5">
              <span className="text-primary/60 shrink-0">•</span>
              <span>{applyInline(line.replace(/^[-•*] /, ""))}</span>
            </div>
          );
        }
        if (line.match(/^\d+\. /)) {
          const [num, ...rest] = line.split(". ");
          return (
            <div key={i} className="flex gap-1.5">
              <span className="text-primary/60 shrink-0 font-medium">{num}.</span>
              <span>{applyInline(rest.join(". "))}</span>
            </div>
          );
        }
        return (
          <p key={i} className={line === "" ? "h-2" : ""}>
            {applyInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function applyInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*?.+?\*\*?)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}
