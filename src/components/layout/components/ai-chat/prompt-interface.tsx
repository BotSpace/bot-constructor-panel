"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Send, Sparkles, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from "@/hooks/use-ai-chat";

export function PromptInterface() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; content: string }>
  >([]);

  const {
    sendMessage,
    isLoading,
    response,
    conversationHistory,
    clearHistory,
  } = useAIChat({
    onSuccess: (responseText) => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: responseText },
      ]);
      setPrompt(""); // Input'ni tozalash
    },
    onError: (error) => {
      console.error("AI Chat Error:", error);
    },
  });

  const handleSubmit = () => {
    if (!prompt.trim() || isLoading) return;

    // User xabarini messages'ga qo'shish
    setMessages((prev) => [...prev, { role: "user", content: prompt }]);

    // AI'ga so'rov yuborish
    sendMessage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Dialog ochilganda messages'ni conversation history'dan yuklash
  useEffect(() => {
    if (open && conversationHistory.length > 0) {
      setMessages(conversationHistory);
    } else if (open && conversationHistory.length === 0) {
      setMessages([]);
    }
  }, [open, conversationHistory]);

  // Dialog yopilganda prompt'ni tozalash
  useEffect(() => {
    if (!open) {
      setPrompt("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="max-h-[90vh] flex flex-col bg-background border-border">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">
                  AI
                </span>
              </div>
              AI Chat Assistant
            </DialogTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  clearHistory();
                  setMessages([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Tozalash
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 min-h-[300px] max-h-[500px] mt-4 pr-4">
          <div className="space-y-4">
            {messages.length === 0 && !isLoading && (
              <Card className="p-6 bg-muted/50 border-border">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Bot yaratishda yordam olish uchun savol bering!
                  </p>
                  <p className="text-xs mt-2">
                    Masalan: "Qanday qilib xabar trigger yarataman?"
                  </p>
                </div>
              </Card>
            )}

            {messages.map((msg, index) => (
              <Card
                key={index}
                className={`p-4 ${
                  msg.role === "user"
                    ? "bg-primary/10 border-primary/20 ml-auto max-w-[80%]"
                    : "bg-card border-border"
                }`}
              >
                <div className="flex items-start gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {msg.role === "user" ? "S" : "AI"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {isLoading && (
              <Card className="p-4 bg-card border-border">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">
                    AI
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Spinner className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Javob tayyorlanmoqda...
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 bg-muted rounded animate-pulse w-full" />
                      <div className="h-3 bg-muted rounded animate-pulse w-5/6" />
                      <div className="h-3 bg-muted rounded animate-pulse w-4/6" />
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="shrink-0 mt-4 space-y-2 border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Savol yozing... (Cmd/Ctrl + Enter yuborish)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none bg-background border-border text-foreground placeholder:text-muted-foreground flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isLoading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
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
            AI yordamchisi bot yaratishda yordam beradi
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
