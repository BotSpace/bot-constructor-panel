"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useFlowStore } from "@/features/bot-constructor/store";
import {
  createAgentSession,
  chatWithAgent,
  resetAgentSession,
  type AgentMessage,
  type AgentChatResponse,
} from "@/services/requests/agent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  Bot,
  Send,
  RotateCcw,
  X,
  Loader2,
  Zap,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Message extends AgentMessage {
  id: string;
}

interface AgentChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgentChatDialog({ open, onOpenChange }: AgentChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<string>("chat");
  const [hasFlow, setHasFlow] = useState(false);
  const [pendingFlow, setPendingFlow] = useState<{ nodes: any[]; edges: any[] } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { setNodes, setEdges } = useFlowStore();

  // Session yaratish
  const initSession = useCallback(async () => {
    try {
      const { session_id } = await createAgentSession();
      setSessionId(session_id);
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content:
            "Salom! 👋 Men Botmother AI agentiman. Qanday Telegram bot yaratishni xohlaysiz? Bot haqida batafsil aytib bering va men sizga flow yaratib beraman.",
        },
      ]);
    } catch {
      toast.error("Agent sessiyasi yaratilmadi");
    }
  }, []);

  useEffect(() => {
    if (open && !sessionId) {
      initSession();
    }
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, sessionId, initSession]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || !sessionId || isLoading) return;

    setInput("");
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res: AgentChatResponse = await chatWithAgent(sessionId, text);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.reply,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setPhase(res.phase);
      setHasFlow(res.has_flow);
      if (res.flow_json) {
        setPendingFlow(res.flow_json);
      }
    } catch {
      toast.error("Xabar yuborishda xatolik");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    if (!sessionId) return;
    try {
      await resetAgentSession(sessionId);
      setMessages([]);
      setPhase("chat");
      setHasFlow(false);
      setPendingFlow(null);
      await initSession();
      toast.success("Suhbat yangilandi");
    } catch {
      toast.error("Yangilashda xatolik");
    }
  };

  const applyFlow = () => {
    if (!pendingFlow) return;
    setNodes(pendingFlow.nodes || []);
    setEdges(pendingFlow.edges || []);
    toast.success("Flow qo'llandi!");
    onOpenChange(false);
  };

  const phaseLabel: Record<string, string> = {
    chat: "Suhbat",
    generating: "Generatsiya...",
    done: "Tayyor",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col gap-0 p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-4 pt-4 pb-3 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-semibold leading-tight">
                  AI Agent
                </DialogTitle>
                <p className="text-xs text-muted-foreground">Bot flow yaratuvchi</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {phaseLabel[phase] || phase}
              </Badge>
              <Button variant="ghost" size="icon-sm" onClick={handleReset} title="Yangilash">
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 overflow-hidden">
          <div ref={scrollRef} className="flex flex-col gap-3 p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="h-3 w-3" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
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
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                  <Bot className="h-3 w-3" />
                </div>
                <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Apply flow banner */}
        {pendingFlow && (
          <div className="px-4 py-2 border-t bg-green-500/10 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Zap className="h-4 w-4" />
              <span className="text-xs font-medium">Flow tayyor!</span>
            </div>
            <Button size="sm" onClick={applyFlow} className="h-7 text-xs gap-1">
              <ChevronDown className="h-3 w-3" />
              Constructorga qo'llash
            </Button>
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Botingiz haqida yozing..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
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
      </DialogContent>
    </Dialog>
  );
}
