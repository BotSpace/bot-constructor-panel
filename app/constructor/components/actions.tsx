// FAYL: app/constructor/components/actions.tsx

"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFlowStore } from "@/constructor/store/flowStore";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Square, RotateCcw, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

// Bot statusi uchun tiplar
type BotStatus = "running" | "stopped";
type UIStatus = BotStatus | "loading" | "error";

// Status indikatori uchun konfiguratsiya
const statusConfig: Record<UIStatus, { label: string; color: string }> = {
  loading: { label: "Tekshirilmoqda...", color: "bg-gray-500" },
  running: { label: "Ishlamoqda", color: "bg-green-500" },
  stopped: { label: "To'xtatilgan", color: "bg-red-500" },
  error: { label: "Xatolik", color: "bg-destructive" },
};

export default function HeaderActions() {
  const [botStatus, setBotStatus] = useState<UIStatus>("loading");
  const [isActionInProgress, setIsActionInProgress] = useState(false);

  // Zustand Store'dan barcha kerakli holat va funksiyalarni olamiz
  const { nodes, edges, initialState, loadFlow, saveFlow } = useFlowStore(
    (state) => ({
      nodes: state.nodes,
      edges: state.edges,
      initialState: state.initialState,
      loadFlow: state.loadFlow,
      saveFlow: state.saveFlow,
    })
  );

  // Joriy flowchart holati saqlangan holatdan farq qilishini tekshiradigan memoized funksiya.
  // Bu keraksiz qayta hisoblashlarning oldini oladi.
  const hasUnsavedChanges = useMemo(() => {
    if (!initialState) return false; // Agar boshlang'ich holat yuklanmagan bo'lsa

    // Elementlarning tartibi o'zgarganda yolg'on o'zgarishni aniqlamaslik uchun
    // massivlarni ID bo'yicha saralab, keyin string'ga o'giramiz.
    const sortNodes = (n: any[]) =>
      [...n].sort((a, b) => a.id.localeCompare(b.id));
    const sortEdges = (e: any[]) =>
      [...e].sort((a, b) => a.id.localeCompare(b.id));

    const currentStateString = JSON.stringify({
      nodes: sortNodes(nodes),
      edges: sortEdges(edges),
    });
    const initialStateString = JSON.stringify({
      nodes: sortNodes(initialState.nodes),
      edges: sortEdges(initialState.edges),
    });

    return currentStateString !== initialStateString;
  }, [nodes, edges, initialState]);

  // Botning joriy holatini serverdan olib keladigan funksiya
  const fetchBotStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/bot/status");
      if (!response.ok) throw new Error();
      const data: { status: BotStatus } = await response.json();
      setBotStatus(data.status);
    } catch (error) {
      setBotStatus("error");
    }
  }, []);

  // Komponent ilk marta render bo'lganda:
  // 1. Flowchart'ning saqlangan holatini yuklaymiz.
  // 2. Botning statusini darhol tekshiramiz.
  // 3. Har 5 soniyada bot statusini tekshirib turishni yo'lga qo'yamiz.
  useEffect(() => {
    loadFlow();
    fetchBotStatus();
    const intervalId = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(intervalId); // Komponent yo'q bo'lganda intervalni tozalaymiz
  }, [loadFlow, fetchBotStatus]);

  // Barcha API so'rovlarini bajaruvchi markaziy funksiya
  const handleApiCall = useCallback(
    async (endpoint: string) => {
      setIsActionInProgress(true);
      try {
        const response = await fetch(endpoint, { method: "POST" });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "API so'rovida noma'lum xatolik"
          );
        }
        // Statusni yangilash uchun biroz kutamiz
        await new Promise((res) => setTimeout(res, 1000));
        await fetchBotStatus();
      } catch (error) {
        await fetchBotStatus(); // Xatolikdan keyin ham statusni aniqlaymiz
        throw error; // Xatoni `toast.promise` ushlab olishi uchun uzatamiz
      } finally {
        setIsActionInProgress(false);
      }
    },
    [fetchBotStatus]
  );

  // Tugmalar uchun alohida handler'lar
  const handleRun = () => {
    toast.promise(handleApiCall("/api/bot/run"), {
      loading: "Bot ishga tushirilmoqda...",
      success: "Bot muvaffaqiyatli ishga tushirildi!",
      error: "Botni ishga tushirishda xatolik!",
    });
  };

  const handleStop = () => {
    toast.promise(handleApiCall("/api/bot/stop"), {
      loading: "Bot to'xtatilmoqda...",
      success: "Bot muvaffaqiyatli to'xtatildi!",
      error: "Botni to'xtatishda xatolik!",
    });
  };

  const handleSaveAndRestart = () => {
    const actionPromise = async () => {
      await saveFlow(); // 1. O'zgarishlarni saqlaymiz
      await handleApiCall("/api/bot/restart"); // 2. Botni qayta ishga tushiramiz
    };

    toast.promise(actionPromise(), {
      loading: "Sxema saqlanmoqda va bot qayta ishga tushirilmoqda...",
      success: "Muvaffaqiyatli saqlandi va qayta ishga tushirildi!",
      error: (err: Error) => `Xatolik: ${err.message}`,
    });
  };

  const handleSaveFlow = () => {
    toast.promise(saveFlow(), {
      loading: "Sxema saqlanmoqda...",
      success: "Muvaffaqiyatli saqlandi!",
      error: (err: Error) => `Xatolik: ${err.message}`,
    });
  };

  const currentConfig = statusConfig[botStatus];
  const isBotRunning = botStatus === "running";

  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center gap-3">
        {/* Status Indikatori */}
        <span
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-white transition-colors",
            currentConfig.color
          )}
        >
          {botStatus === "loading" || isActionInProgress ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-white/80 inline-block" />
          )}
          {currentConfig.label}
        </span>

        {/* Run Tugmasi */}
        <Button
          onClick={handleRun}
          variant="outline"
          size="sm"
          disabled={isBotRunning || isActionInProgress}
        >
          <Play className="mr-2 h-4 w-4" /> Run
        </Button>

        {/* Stop Tugmasi */}
        <Button
          onClick={handleStop}
          variant="outline"
          size="sm"
          disabled={!isBotRunning || isActionInProgress}
        >
          <Square className="mr-2 h-4 w-4" /> Stop
        </Button>

        {/* Restart & Save Tugmasi */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSaveAndRestart}
              variant="outline"
              size="sm"
              disabled={
                !hasUnsavedChanges || !isBotRunning || isActionInProgress
              }
            >
              <div className="flex items-center gap-2">
                {isActionInProgress && isBotRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}
                <span>Restart & Save</span>
                {hasUnsavedChanges && !isActionInProgress && (
                  <Badge
                    variant="destructive"
                    className="animate-in fade-in-50"
                  >
                    Unsaved
                  </Badge>
                )}
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {hasUnsavedChanges ? (
              <p>
                Saqlanmagan o'zgarishlarni faylga yozish va botni qayta ishga
                tushirish.
              </p>
            ) : (
              <p>Saqlanmagan o'zgarishlar yo'q.</p>
            )}
          </TooltipContent>
        </Tooltip>

        {/* Stop Tugmasi */}
        <Button
          onClick={handleSaveFlow}
          variant="outline"
          size="sm"
          disabled={!hasUnsavedChanges}
        >
          <Save className="mr-2 h-4 w-4" /> Save
          {hasUnsavedChanges && !isActionInProgress && (
            <Badge variant="destructive" className="animate-in fade-in-50">
              Unsaved
            </Badge>
          )}
        </Button>
      </div>
    </TooltipProvider>
  );
}
