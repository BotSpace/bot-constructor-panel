"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Send,
  Sparkles,
  X,
  Bot,
  User,
  Trash2,
  History,
  MessageSquare,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/use-ai-chat";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  getChatHistory,
  saveChat,
  createChatHistory,
  deleteChat,
  generateChatTitle,
  type ChatHistoryItem,
} from "@/lib/chat-history-storage";
import { AI_AGENTS, DEFAULT_AGENT, type AIAgent } from "@/lib/ai-agents";

interface ChatWidgetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewMode = "chat" | "history";

export function ChatWidget({ open, onOpenChange }: ChatWidgetProps) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string; timestamp: Date }>
  >([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(DEFAULT_AGENT);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    sendMessage,
    isLoading,
    conversationHistory,
    clearHistory,
  } = useAIChat({
    agent: selectedAgent.model,
    onSuccess: (responseText) => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        },
      ]);
      setPrompt("");
      // Chat'ni saqlash
      saveCurrentChat();
    },
    onError: (error) => {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ Xatolik: ${error}`,
          timestamp: new Date(),
        },
      ]);
    },
  });

  // Chatlar tarixini yuklash
  useEffect(() => {
    if (open) {
      loadChatHistory();
    }
  }, [open]);

  const loadChatHistory = () => {
    const history = getChatHistory();
    setChatHistory(history.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const saveCurrentChat = () => {
    if (messages.length === 0) return;

    const chatMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const title = messages.length > 0 
      ? generateChatTitle(messages[0].content)
      : "Yangi suhbat";

    const existingChat = currentChatId
      ? chatHistory.find((c) => c.id === currentChatId)
      : null;

    const chat: ChatHistoryItem = existingChat
      ? {
          ...existingChat,
          messages: chatMessages.map((msg) => ({
            ...msg,
            timestamp: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        }
      : createChatHistory(title, selectedAgent.id, chatMessages);

    saveChat(chat);
    if (!currentChatId) {
      setCurrentChatId(chat.id);
    }
    loadChatHistory();
  };

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    // Agar yangi chat bo'lsa, chat yaratish
    if (!currentChatId && messages.length === 0) {
      const newChat = createChatHistory(
        generateChatTitle(prompt),
        selectedAgent.id,
        []
      );
      setCurrentChatId(newChat.id);
    }

    // User xabarini messages'ga qo'shish
    const userMessage = {
      role: "user" as const,
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // AI'ga so'rov yuborish
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    clearHistory();
    setMessages([]);
    setCurrentChatId(null);
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      saveCurrentChat();
    }
    clearHistory();
    setMessages([]);
    setCurrentChatId(null);
    setViewMode("chat");
  };

  const handleLoadChat = (chat: ChatHistoryItem) => {
    setCurrentChatId(chat.id);
    setMessages(
      chat.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }))
    );
    // Agent'ni yuklash
    const agent = AI_AGENTS.find((a) => a.id === chat.agent) || DEFAULT_AGENT;
    setSelectedAgent(agent);
    setViewMode("chat");
  };

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteChat(chatId);
    if (currentChatId === chatId) {
      handleNewChat();
    }
    loadChatHistory();
  };

  // Dialog ochilganda messages'ni conversation history'dan yuklash
  useEffect(() => {
    if (open && conversationHistory.length > 0 && messages.length === 0) {
      const historyWithTimestamps = conversationHistory.map((msg) => ({
        ...msg,
        timestamp: new Date(),
      }));
      setMessages(historyWithTimestamps);
    } else if (open && conversationHistory.length === 0 && messages.length === 0) {
      setMessages([]);
    }
  }, [open, conversationHistory]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && viewMode === "chat") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, viewMode]);

  // Dialog yopilganda prompt'ni tozalash va chat'ni saqlash
  useEffect(() => {
    if (!open) {
      if (messages.length > 0) {
        saveCurrentChat();
      }
      setPrompt("");
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col bg-background"
      >
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg">
                <Image
                  src={"/ai.png"}
                  alt="AI"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-foreground">
                  AI Chat Assistant
                </SheetTitle>
                <p className="text-xs text-muted-foreground">
                  Bot yaratishda yordamchi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode(viewMode === "chat" ? "history" : "chat")}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                title={viewMode === "chat" ? "Chatlar tarixi" : "Chatga qaytish"}
              >
                {viewMode === "chat" ? (
                  <History className="h-4 w-4" />
                ) : (
                  <MessageSquare className="h-4 w-4" />
                )}
              </Button>
              {viewMode === "chat" && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  title="Suhbatni tozalash"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {viewMode === "chat" && (
            <div className="flex items-center gap-2">
              <Select
                value={selectedAgent.id}
                onValueChange={(value) => {
                  const agent = AI_AGENTS.find((a) => a.id === value) || DEFAULT_AGENT;
                  setSelectedAgent(agent);
                }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AI_AGENTS.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{agent.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {agent.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewChat}
                className="h-8 text-xs"
              >
                Yangi chat
              </Button>
            </div>
          )}
        </SheetHeader>

        {/* Content Area */}
        {viewMode === "chat" ? (
          <>
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-4 py-4">
              <div className="space-y-4">
                {messages.length === 0 && !isLoading && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4">
                      <Sparkles className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      AI yordamchiga xush kelibsiz!
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-[280px] mb-4">
                      Bot yaratishda yordam olish uchun savol bering. Men sizga
                      node konfiguratsiyalari, flow yaratish va optimallashtirish
                      bo'yicha tavsiyalar beraman.
                    </p>
                    <div className="space-y-2 w-full max-w-[280px]">
                      <div className="text-xs text-muted-foreground font-medium">
                        Misol savollar:
                      </div>
                      <div className="space-y-1.5">
                        {[
                          "Qanday qilib xabar trigger yarataman?",
                          "Bot flow'ni qanday optimallashtirish mumkin?",
                          "CustomCode node qanday ishlaydi?",
                        ].map((example, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPrompt(example)}
                            className="w-full text-left px-3 py-2 text-xs bg-muted/50 hover:bg-muted rounded-md transition-colors text-foreground"
                          >
                            {example}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300",
                      msg.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm border border-border/50"
                      )}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                      <div
                        className={cn(
                          "text-xs mt-1.5 opacity-70",
                          msg.role === "user"
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {msg.timestamp.toLocaleTimeString("uz-UZ", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3 justify-start animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                    <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 bg-muted border border-border/50 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <Spinner className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Javob tayyorlanmoqda...
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-2 bg-muted-foreground/20 rounded-full animate-pulse w-full" />
                        <div className="h-2 bg-muted-foreground/20 rounded-full animate-pulse w-5/6" />
                        <div className="h-2 bg-muted-foreground/20 rounded-full animate-pulse w-4/6" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="shrink-0 border-t bg-background p-4 space-y-2">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Savol yozing... (Enter yuborish)"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-[60px] max-h-[120px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground flex-1 text-sm"
                  disabled={isLoading}
                  rows={2}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!prompt.trim() || isLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 self-end h-[60px] px-4"
                  size="lg"
                >
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Shift + Enter yangi qator, Enter yuborish
              </p>
            </div>
          </>
        ) : (
          /* History View */
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-2">
              {chatHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Hozircha chatlar tarixi yo'q
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Yangi chat yarating va suhbatni boshlang
                  </p>
                </div>
              ) : (
                chatHistory.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => handleLoadChat(chat)}
                    className={cn(
                      "group relative p-3 rounded-lg border cursor-pointer transition-colors",
                      currentChatId === chat.id
                        ? "bg-primary/10 border-primary/50"
                        : "bg-muted/30 hover:bg-muted/50 border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground truncate">
                            {chat.title}
                          </h4>
                          <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background rounded">
                            {AI_AGENTS.find((a) => a.id === chat.agent)?.name || chat.agent}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {chat.messages[0]?.content || "Bo'sh chat"}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{chat.messages.length} xabar</span>
                          <span>•</span>
                          <span>
                            {new Date(chat.updatedAt).toLocaleDateString("uz-UZ", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleDeleteChat(chat.id, e)}
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
