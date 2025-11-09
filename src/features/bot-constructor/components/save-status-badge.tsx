"use client";

import { Check, AlertCircle, Loader2 } from "lucide-react";

type SaveStatus = "idle" | "saving" | "saved" | "unsaved";

interface SaveStatusBadgeProps {
  status: SaveStatus;
  lastSavedTime?: Date;
}

export function SaveStatusBadge({
  status,
  lastSavedTime,
}: SaveStatusBadgeProps) {
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
    unsaved: {
      styles: `${baseStyles} bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30`,
      icon: <AlertCircle className="w-4 h-4" />,
      text: "Unsaved changes",
    },
  };

  const config = statusConfigs[status];

  return (
    <div className={`${config.styles} pointer-events-none`}>
      {config.icon}
      <span>{config.text}</span>
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
