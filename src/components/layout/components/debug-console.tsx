"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Terminal, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import useProjectStore from "@/features/bot-constructor/store/project";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug" | "log";
  message: string;
}

type BotType = "debug" | "release";

export function DebugConsole() {
  const { project } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType>("debug");
  const [isConnected, setIsConnected] = useState(false);
  const [height, setHeight] = useState(300); // Default height
  const [isResizing, setIsResizing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef({ y: 0, height: 0 });

  // Ctrl + ` bilan toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "`") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  // Resize handler
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      resizeStartRef.current = {
        y: e.clientY,
        height: height,
      };
    },
    [height]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = resizeStartRef.current.y - e.clientY; // Yuqoriga tortilganda musbat
      const newHeight = Math.max(
        100,
        Math.min(800, resizeStartRef.current.height + deltaY)
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  // SSE connection
  useEffect(() => {
    if (!isOpen) {
      // Console yopilganda connection ni yopamiz
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Bot type o'zgarganda loglarni tozalaymiz
    setLogs([]);

    // Bot type ga qarab service_id ni olamiz
    const serviceId =
      selectedBot === "debug"
        ? project?.debug?.service_id
        : project?.release?.service_id;

    if (!serviceId) {
      setIsConnected(false);
      return;
    }

    // SSE connection
    const url = `https://botlarnionasi.jscorp.uz/sse/api/project/${project?.release?.service_id}/logs/`;
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onopen = () => {
      setIsConnected(true);
      addLog("info", `Connected to ${selectedBot} bot logs`);
    };

    eventSourceRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const level = data.level || "info";
        const message = data.message || event.data;
        addLog(level, message);
      } catch (error) {
        // Plain text log
        addLog("info", event.data);
      }
    };

    eventSourceRef.current.onerror = () => {
      setIsConnected(false);
      addLog("error", "Connection error. Reconnecting...");
    };

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        setIsConnected(false);
      }
    };
  }, [
    isOpen,
    selectedBot,
    project?.debug?.service_id,
    project?.release?.service_id,
  ]);

  const addLog = useCallback((level: LogEntry["level"], message: string) => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const milliseconds = String(now.getMilliseconds()).padStart(3, "0");
    const timestamp = `${hours}:${minutes}:${seconds}.${milliseconds}`;

    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp,
      level,
      message,
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(logText);
  };

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warning":
        return "text-yellow-400";
      case "info":
        return "text-blue-400";
      case "debug":
        return "text-gray-400";
      default:
        return "text-foreground";
    }
  };

  const getLogPrefix = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "[ERR]";
      case "warning":
        return "[WRN]";
      case "info":
        return "[INF]";
      case "debug":
        return "[DBG]";
      default:
        return "[LOG]";
    }
  };

  const debugServiceId = project?.debug?.service_id;
  const releaseServiceId = project?.release?.service_id;
  const hasDebugBot = !!debugServiceId;
  const hasReleaseBot = !!releaseServiceId;

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#1e1e1e] border-t border-[#3e3e3e]"
      style={{ height: `${height}px` }}
    >
      {/* Header */}
      <div className="relative flex items-center justify-between h-10 px-4 bg-[#252526] border-b border-[#3e3e3e]">
        {/* Resize handle */}
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-[#007acc] transition-colors z-10",
            isResizing && "bg-[#007acc]"
          )}
        />
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#cccccc]" />
          <span className="text-sm font-medium text-[#cccccc]">
            Debug Console
          </span>

          {/* Bot type selector */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setSelectedBot("debug")}
              className={cn(
                "px-2 py-0.5 text-xs rounded transition-colors",
                selectedBot === "debug"
                  ? "bg-[#007acc] text-white"
                  : "text-[#cccccc] hover:bg-[#3e3e3e]",
                !hasDebugBot && "opacity-50 cursor-not-allowed"
              )}
              disabled={!hasDebugBot}
            >
              Debug Bot
            </button>
            <button
              onClick={() => setSelectedBot("release")}
              className={cn(
                "px-2 py-0.5 text-xs rounded transition-colors",
                selectedBot === "release"
                  ? "bg-[#007acc] text-white"
                  : "text-[#cccccc] hover:bg-[#3e3e3e]",
                !hasReleaseBot && "opacity-50 cursor-not-allowed"
              )}
              disabled={!hasReleaseBot}
            >
              Release Bot
            </button>
          </div>

          {/* Connection status */}
          <div className="flex items-center gap-2 ml-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-xs text-[#cccccc]">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={copyLogs}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Copy logs"
          >
            <Copy className="w-4 h-4 text-[#cccccc]" />
          </button>
          <button
            onClick={clearLogs}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4 text-[#cccccc]" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Close (Ctrl + `)"
          >
            <X className="w-4 h-4 text-[#cccccc]" />
          </button>
        </div>
      </div>

      {/* Logs area */}
      <div className="h-[calc(100%-40px)] overflow-y-auto overflow-x-auto px-4 py-2 font-mono text-xs leading-relaxed">
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[#858585]">
            {!hasDebugBot && !hasReleaseBot
              ? "No bot configured. Add a debug or release bot to see logs."
              : selectedBot === "debug" && !hasDebugBot
              ? "Debug bot is not configured."
              : selectedBot === "release" && !hasReleaseBot
              ? "Release bot is not configured."
              : "Waiting for logs..."}
          </div>
        ) : (
          <div className="space-y-0.5">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 hover:bg-[#2a2d2e]/50 -mx-2 px-2 py-0.5 rounded"
              >
                <span className="text-[#858585] shrink-0 w-20">
                  {log.timestamp}
                </span>
                <span
                  className={cn(
                    "shrink-0 w-12 font-semibold",
                    getLogColor(log.level)
                  )}
                >
                  {getLogPrefix(log.level)}
                </span>
                <span
                  className={cn("flex-1 break-all", getLogColor(log.level))}
                >
                  {log.message}
                </span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
