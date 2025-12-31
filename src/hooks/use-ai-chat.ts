"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  sendChatMessage,
  type ChatMessage,
  type ChatRequest,
} from "@/services/requests/ai";
import { handleApiError } from "@/lib/error-handler";
import toast from "react-hot-toast";

export interface UseAIChatOptions {
  onSuccess?: (response: string) => void;
  onError?: (error: string) => void;
  agent?: string; // AI agent model nomi
}

export function useAIChat(options?: UseAIChatOptions) {
  const [conversationHistory, setConversationHistory] = useState<ChatMessage[]>(
    []
  );

  const mutation = useMutation({
    mutationFn: async (message: string) => {
      const request: ChatRequest = {
        message,
        conversationHistory,
        agent: options?.agent,
      };

      const response = await sendChatMessage(request);
      return response.data;
    },
    onSuccess: (data, message) => {
      // Conversation history'ga qo'shish
      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.message },
      ]);

      options?.onSuccess?.(data.message);
    },
    onError: (error: unknown) => {
      const apiError = handleApiError(error);
      let errorMessage =
        apiError.message || "AI so'rovni bajarishda xatolik yuz berdi";

      // 429 (Quota exceeded) xatolari uchun batafsil xabar
      if (apiError.status === 429) {
        // Axios error response'dan retryAfter olish
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object" &&
          "data" in error.response
        ) {
          const responseData = (error.response as any).data;
          if (responseData.retryAfter) {
            errorMessage = `${errorMessage} (${responseData.retryAfter}s kutish)`;
          }
          if (responseData.details) {
            errorMessage = `${errorMessage}\n\n${responseData.details}`;
          }
        }
      }

      toast.error(errorMessage, {
        duration: apiError.status === 429 ? 10000 : 5000, // Quota xatolari uchun uzoqroq ko'rsatish
      });
      options?.onError?.(errorMessage);
    },
  });

  const sendMessage = (message: string) => {
    if (!message.trim()) {
      toast.error("Xabar bo'sh bo'lishi mumkin emas");
      return;
    }

    mutation.mutate(message);
  };

  const clearHistory = () => {
    setConversationHistory([]);
  };

  return {
    sendMessage,
    isLoading: mutation.isPending,
    response: mutation.data?.message,
    error: mutation.error,
    conversationHistory,
    clearHistory,
  };
}
