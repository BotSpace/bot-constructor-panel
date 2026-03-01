"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  createAgentSession,
  chatWithAgent,
  resetAgentSession,
  listAgentSessions,
  deleteAgentSession,
  type AgentMessage,
  type AgentChatResponse,
  type AgentSession,
} from "@/services/requests/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  Plus,
  Trash2,
  X,
  Loader2,
  Zap,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface Message extends AgentMessage {
  id: string;
}

interface AgentChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const phaseLabel: Record<string, { label: string; color: string }> = {
  chat: { label: "Suhbat", color: "secondary" },
  generating: { label: "Generatsiya...", color: "default" },
  done: { label: "Tayyor ✓", color: "default" },
};

export function AgentChatDialog({ open, onOpenChange }: AgentChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<AgentSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [phase, setPhase] = useState<string>("chat");
  const [pendingFlow, setPendingFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodes, setEdges } = useFlowStore();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load sessions list
  const loadSessions = useCallback(async () => {
    setIsSessionsLoading(true);
    try {
      const list = await listAgentSessions();
      setSessions(list);
    } catch {
      // silent
    } finally {
      setIsSessionsLoading(false);
    }
  }, []);

  // Create new session
  const createNewSession = useCallback(async () => {
    try {
      const { session_id } = await createAgentSession();
      setSessionId(session_id);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Salom! 👋 Men Botmother AI agentiman. Qanday Telegram bot yaratishni xohlaysiz? Bot haqida batafsil aytib bering.",
        },
      ]);
      setPhase("chat");
      setPendingFlow(null);
      await loadSessions();
    } catch {
      toast.error("Sessiya yaratilmadi");
    }
  }, [loadSessions]);

  // Open existing session
  const openSession = useCallback(async (sid: string) => {
    setSessionId(sid);
    setMessages([]);
    setPhase("chat");
    setPendingFlow(null);
    // Load history — show welcome if empty
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Suhbat davom etmoqda...",
      },
    ]);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  // Delete session
  const handleDeleteSession = useCallback(
    async (e: React.MouseEvent, sid: string) => {
      e.stopPropagation();
      try {
        await deleteAgentSession(sid);
        if (sessionId === sid) {
          setSessionId(null);
          setMessages([]);
        }
        setSessions((prev) => prev.filter((s) => s.session_id !== sid));
        toast.success("Suhbat o'chirildi");
      } catch {
        toast.error("O'chirishda xatolik");
      }
    },
    [sessionId]
  );

  useEffect(() => {
    if (open) {
      loadSessions();
      if (!sessionId) {
        createNewSession();
      }
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || isLoading) return;

    setInput("");
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res: AgentChatResponse = await chatWithAgent(sessionId, text);
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: "assistant", content: res.reply },
      ]);
      setPhase(res.phase);
      if (res.flow_json) setPendingFlow(res.flow_json);
      // Refresh sessions list to update metadata
      loadSessions();
    } catch {
      toast.error("Xabar yuborishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const applyFlow = () => {
    if (!pendingFlow) return;
    setNodes(pendingFlow.nodes || []);
    setEdges(pendingFlow.edges || []);
    toast.success("Flow qo'llandi!");
    onOpenChange(false);
  };

  const currentPhase = phaseLabel[phase] ?? { label: phase, color: "secondary" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[820px] h-[85vh] p-0 gap-0 overflow-hidden flex flex-col"
        showCloseButton={false}
      >
        <div className="flex h-full overflow-hidden">
          {/* ── Sidebar ── */}
          <div className="w-[220px] shrink-0 border-r flex flex-col bg-muted/30">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-3 py-3 border-b">
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Bot className="h-4 w-4 text-primary" />
                AI Agent
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7"
                onClick={createNewSession}
                title="Yangi suhbat"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Sessions list */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {isSessionsLoading && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
                {!isSessionsLoading && sessions.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Hali suhbat yo'q
                  </p>
                )}
                {sessions.map((s) => (
                  <button
                    key={s.session_id}
                    onClick={() => openSession(s.session_id)}
                    className={cn(
                      "w-full flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs transition-colors group",
                      sessionId === s.session_id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1 truncate">
                      Suhbat #{s.session_id.slice(-6)}
                    </span>
                    {s.has_flow && (
                      <Zap className="h-3 w-3 text-green-500 shrink-0" />
                    )}
                    <button
                      onClick={(e) => handleDeleteSession(e, s.session_id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* ── Main chat area ── */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate">
                    {sessionId ? `Suhbat #${sessionId.slice(-6)}` : "Yangi suhbat"}
                  </p>
                  <p className="text-xs text-muted-foreground">Bot flow yaratuvchi</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {currentPhase.label}
                </Badge>
                <Separator orientation="vertical" className="h-5" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 overflow-hidden">
              <div className="flex flex-col gap-3 p-4 pb-2">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">AI Agent tayyor</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Bot haqida yozing, flow yaratib beraman
                      </p>
                    </div>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                        <Bot className="h-3 w-3" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3 py-2 text-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
                      <Bot className="h-3 w-3" />
                    </div>
                    <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2.5">
                      <div className="flex gap-1 items-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:0ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:150ms]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Apply flow banner */}
            {pendingFlow && (
              <div className="mx-4 mb-2 rounded-xl border border-green-500/30 bg-green-500/10 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <Zap className="h-4 w-4 shrink-0" />
                  <span className="text-xs font-medium">Flow tayyor! Constructorga qo'llash mumkin.</span>
                </div>
                <Button
                  size="sm"
                  onClick={applyFlow}
                  className="h-7 text-xs gap-1 shrink-0"
                >
                  <ChevronRight className="h-3 w-3" />
                  Qo'llash
                </Button>
              </div>
            )}

            {/* Input area */}
            <div className="px-4 pb-4 pt-2 border-t shrink-0">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Botingiz haqida yozing..."
                  disabled={isLoading || !sessionId}
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading || !sessionId}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5 text-center">
                Enter — yuborish
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

