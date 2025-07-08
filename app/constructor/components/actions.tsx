"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useFlowStore } from "@/constructor/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Play, Square, RotateCcw, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { shallow } from "zustand/shallow";

type BotStatus = "running" | "stopped";
type UIStatus = BotStatus | "loading" | "error";

const statusConfig: Record<UIStatus, { label: string; color: string }> = {
  loading: { label: "Tekshirilmoqda...", color: "bg-gray-500" },
  running: { label: "Ishlamoqda", color: "bg-green-500" },
  stopped: { label: "To'xtatilgan", color: "bg-red-500" },
  error: { label: "Xatolik", color: "bg-destructive" },
};

export default function HeaderActions() {
  const [botStatus, setBotStatus] = useState<UIStatus>("loading");
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [isRecentlySaved, setIsRecentlySaved] = useState(false);

  const { isDirty, loadFlow, saveFlow } = useFlowStore(
    (state) => ({
      isDirty: state.isDirty, // Faqat kerakli `isDirty` holatini olamiz
      loadFlow: state.loadFlow,
      saveFlow: state.saveFlow,
    }),
    shallow // Keraksiz re-renderlarning oldini oladi
  );

  const hasUnsavedChanges = isDirty;

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

  useEffect(() => {
    loadFlow();
    fetchBotStatus();
    const intervalId = setInterval(fetchBotStatus, 5000);
    return () => clearInterval(intervalId);
  }, [loadFlow, fetchBotStatus]);

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
        await new Promise((res) => setTimeout(res, 1000));
        await fetchBotStatus();
      } catch (error) {
        await fetchBotStatus();
        throw error;
      } finally {
        setIsActionInProgress(false);
      }
    },
    [fetchBotStatus]
  );

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

  const handleSaveFlow = () => {
    toast.promise(saveFlow(), {
      loading: "Saqlanmoqda...",
      success: () => {
        setIsRecentlySaved(true);
        setTimeout(() => setIsRecentlySaved(false), 2000);
        return "Muvaffaqiyatli saqlandi!";
      },
      error: (err: Error) => `Xatolik: ${err.message}`,
    });
  };

  const currentConfig = statusConfig[botStatus];
  const isBotRunning = botStatus === "running";

  // Ctrl+S (Cmd+S) shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (hasUnsavedChanges && !isActionInProgress) {
          handleSaveFlow();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasUnsavedChanges, isActionInProgress, handleSaveFlow]);

  // Ctrl+R (Cmd+R) shortcut for reloading server (stop then run)

  function ReloadBot() {
    if (!isActionInProgress) {
      handleStop();
      setTimeout(() => {
        handleRun();
      }, 500); // Give a short delay to ensure stop completes
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "r") {
        e.preventDefault();
        ReloadBot();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActionInProgress, handleStop, handleRun]);

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

        {/* reload */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={ReloadBot}
              variant="outline"
              size="sm"
              disabled={isActionInProgress}
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Reload
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Reload bot (Ctrl + R)</TooltipContent>
        </Tooltip>

        {/* Save Tugmasi */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleSaveFlow}
              variant={hasUnsavedChanges ? "default" : "outline"}
              size="sm"
              disabled={!hasUnsavedChanges || isActionInProgress}
              className="relative"
            >
              {isActionInProgress ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : isRecentlySaved ? (
                <span className="text-green-600 font-semibold">Saved</span>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Save
                </>
              )}

              {hasUnsavedChanges && !isActionInProgress && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 h-2 w-2 rounded-full bg-red-500 animate-ping" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>
            you can save with Ctrl + S
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
