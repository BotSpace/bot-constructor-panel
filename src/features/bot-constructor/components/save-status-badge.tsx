"use client";

import { Check, AlertCircle, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useFlowStore } from "../store";
import { cn } from "@/lib/utils";

interface SaveStatusBadgeProps {
  className?: string;
}

export function SaveStatusBadge({ className }: SaveStatusBadgeProps) {
  const { isDirty, isLoading, lastSavedTime, countdownRemaining } =
    useFlowStore();

  // Countdown ni sekundlarga aylantirish
  const countdownSeconds = useMemo(() => {
    if (countdownRemaining === null) return null;
    return Math.ceil(countdownRemaining / 1000);
  }, [countdownRemaining]);

  // Statusni aniqlash
  const status = useMemo(() => {
    if (isLoading) return "saving";
    if (isDirty && countdownRemaining !== null && countdownRemaining > 0)
      return "countdown";
    if (isDirty) return "unsaved";
    if (lastSavedTime) return "saved";
    return "idle";
  }, [isDirty, isLoading, lastSavedTime, countdownRemaining]);

  const baseStyles =
    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300";

  const statusConfigs = {
    idle: {
      styles: `${baseStyles} opacity-0 pointer-events-none`,
      icon: null,
      text: "",
    },
    saving: {
      styles: `${baseStyles} bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30`,
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      text: "Saving...",
    },
    saved: {
      styles: `${baseStyles} bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-500/30`,
      icon: <Check className="w-4 h-4" />,
      text: "Saved",
    },
    countdown: {
      styles: `${baseStyles} bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30`,
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Unsaved changes",
    },
    unsaved: {
      styles: `${baseStyles} bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30`,
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Unsaved changes",
    },
  };

  const config = statusConfigs[status];

  return (
    <div className={cn(config.styles, "pointer-events-none", className)}>
      {config.icon}
      <span>{config.text}</span>
      {status === "countdown" && countdownSeconds !== null && (
        <span className="text-xs opacity-75 font-mono">
          ({countdownSeconds}s)
        </span>
      )}
      {lastSavedTime && status === "saved" && (
        <span className="text-xs opacity-75">
          {lastSavedTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}
