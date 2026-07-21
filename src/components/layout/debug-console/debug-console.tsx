"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Terminal, Trash2, Copy, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import useProjectStore from "@/features/bot-constructor/store/project";
import { debugConsoleStore } from "@/components/layout/debug-console/store";
import { instanceAuth } from "@/services/instance";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug" | "log";
  message: string;
}

type BotType = "debug" | "release";
interface ExecutionSummary {
  id: string;
  chat_id: number;
  trigger_type: string;
  runtime_mode: BotType;
  status: "running" | "waiting" | "succeeded" | "failed" | "cancelled";
  current_node_id?: string;
  error?: string;
  started_at: string;
  finished_at?: string;
}

interface ExecutionNodeRun {
  id: string;
  node_id: string;
  node_type: string;
  attempt: number;
  status: ExecutionSummary["status"];
  error?: string;
  started_at: string;
  finished_at?: string;
}

export function DebugConsole() {
  const { project } = useProjectStore();
  const { isOpen, open, close, toggle, height, setHeight, view, setView } = debugConsoleStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedBot, setSelectedBot] = useState<BotType>("debug");
  const [executions, setExecutions] = useState<ExecutionSummary[]>([]);
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null);
  const [nodeRuns, setNodeRuns] = useState<ExecutionNodeRun[]>([]);
  const [executionsLoading, setExecutionsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeStartRef = useRef({ y: 0, height: 0 });
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);

  // Ctrl + ` bilan toggle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.code === "Backquote") {
        e.preventDefault();
        toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggle]);

  // Scroll position ni kuzatish
  useEffect(() => {
    if (!isOpen || !logsContainerRef.current) return;

    const container = logsContainerRef.current;

    // Birinchi marta scroll position ni tekshiramiz
    const checkScrollPosition = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      shouldAutoScrollRef.current = isNearBottom;
    };

    // Birinchi marta tekshiramiz
    checkScrollPosition();

    const handleScroll = () => {
      checkScrollPosition();
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  // Auto scroll to bottom (faqat foydalanuvchi pastda bo'lsa)
  useEffect(() => {
    if (isOpen && shouldAutoScrollRef.current) {
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
  }, [isResizing, setHeight]);

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

  // Log polling
  useEffect(() => {
    if (!isOpen || view !== "logs") {
      setIsConnected(false);
      return;
    }

    // Bot type o'zgarganda loglarni tozalaymiz va auto scroll ni yoqamiz
    setLogs([]);
    shouldAutoScrollRef.current = true;

    const path =
      selectedBot === "debug"
        ? project?.id
          ? `/projects/${project.id}/debug/logs`
          : null
        : project?.release?.id
          ? `/relase/${project.release.id}/logs`
          : null;

    if (!path) {
      setIsConnected(false);
      return;
    }

    let cancelled = false;
    let seen = 0;
    const loadLogs = async () => {
      try {
        const { data } = await instanceAuth.get<{ lines?: string[] }>(path, {
          params: { tail: 200 },
        });
        if (cancelled) return;
        const lines = data.lines ?? [];
        setIsConnected(true);
        for (const line of lines.slice(seen)) {
          addLog("log", line);
        }
        seen = lines.length;
      } catch {
        if (cancelled) return;
        setIsConnected(false);
        addLog("error", "Loglarni olishda xatolik yuz berdi.");
      }
    };

    void loadLogs();
    const interval = window.setInterval(() => void loadLogs(), 3000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
      setIsConnected(false);
    };
  }, [
    isOpen,
    selectedBot,
    project?.id,
    project?.release?.id,
    addLog,
    view,
  ]);

  // Durable execution timeline. This remains useful after a pod restart,
  // unlike raw container logs, and links each Telegram update to node attempts.
  useEffect(() => {
    if (!isOpen || view !== "executions" || !project?.id) return;
    let cancelled = false;
    const load = async () => {
      setExecutionsLoading(true);
      try {
        const { data } = await instanceAuth.get<ExecutionSummary[]>("/executions", {
          params: { project_id: project.id, runtime_mode: selectedBot, limit: 100 },
        });
        if (!cancelled) setExecutions(data ?? []);
      } finally {
        if (!cancelled) setExecutionsLoading(false);
      }
    };
    void load();
    const interval = window.setInterval(() => void load(), 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isOpen, view, project?.id, selectedBot]);

  useEffect(() => {
    if (!selectedExecution || view !== "executions") {
      setNodeRuns([]);
      return;
    }
    let cancelled = false;
    void instanceAuth
      .get<{ node_runs?: ExecutionNodeRun[] }>(`/executions/${selectedExecution}`)
      .then(({ data }) => {
        if (!cancelled) setNodeRuns(data.node_runs ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedExecution, view]);

  const clearLogs = () => {
    setLogs([]);
    shouldAutoScrollRef.current = true;
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

  if (!isOpen)
    return null;

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

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setView("logs")}
              className={cn(
                "px-2 py-0.5 text-xs rounded",
                view === "logs" ? "bg-[#3e3e3e] text-white" : "text-[#aaaaaa] hover:bg-[#333333]"
              )}
            >
              Logs
            </button>
            <button
              onClick={() => setView("executions")}
              className={cn(
                "px-2 py-0.5 text-xs rounded",
                view === "executions" ? "bg-[#3e3e3e] text-white" : "text-[#aaaaaa] hover:bg-[#333333]"
              )}
            >
              Executions
            </button>
          </div>

          {view === "executions" ? (
            <div className="ml-2 flex items-center gap-1">
              {(["debug", "release"] as BotType[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setSelectedBot(mode);
                    setSelectedExecution(null);
                  }}
                  className={cn(
                    "rounded px-2 py-0.5 text-xs capitalize",
                    selectedBot === mode ? "bg-[#007acc] text-white" : "text-[#aaaaaa] hover:bg-[#333333]"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : null}

          {/* Bot type selector */}
          <div className={cn("items-center gap-1 ml-2", view === "logs" ? "flex" : "hidden")}>
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
          <div className={cn("items-center gap-2 ml-2", view === "logs" ? "flex" : "hidden")}>
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
          {view === "logs" && <button
            onClick={copyLogs}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Copy logs"
          >
            <Copy className="w-4 h-4 text-[#cccccc]" />
          </button>}
          {view === "logs" && <button
            onClick={clearLogs}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-4 h-4 text-[#cccccc]" />
          </button>}
          <button
            onClick={close}
            className="p-1.5 hover:bg-[#3e3e3e] rounded transition-colors"
            title="Close (Ctrl + `)"
          >
            <X className="w-4 h-4 text-[#cccccc]" />
          </button>
        </div>
      </div>

      {/* Logs area */}
      {view === "logs" ? <div
        ref={logsContainerRef}
        className="h-[calc(100%-40px)] overflow-y-auto overflow-x-auto px-4 py-2 font-mono text-xs leading-relaxed"
      >
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
      </div> : (
        <div className="grid h-[calc(100%-40px)] grid-cols-[minmax(280px,38%)_1fr] overflow-hidden font-mono text-xs">
          <div className="overflow-y-auto border-r border-[#3e3e3e]">
            {executionsLoading && executions.length === 0 ? (
              <div className="p-4 text-[#858585]">Executionlar yuklanmoqda…</div>
            ) : executions.length === 0 ? (
              <div className="p-4 text-[#858585]">Hali execution yozilmagan.</div>
            ) : executions.map((execution) => (
              <button
                key={execution.id}
                onClick={() => setSelectedExecution(execution.id)}
                className={cn(
                  "flex w-full items-start gap-2 border-b border-[#333] px-3 py-2 text-left hover:bg-[#2a2d2e]",
                  selectedExecution === execution.id && "bg-[#37373d]"
                )}
              >
                <Activity className={cn(
                  "mt-0.5 h-3.5 w-3.5 shrink-0",
                  execution.status === "failed" ? "text-red-400" :
                    execution.status === "waiting" ? "text-yellow-400" :
                      execution.status === "running" ? "text-blue-400" : "text-green-400"
                )} />
                <span className="min-w-0 flex-1">
                  <span className="flex justify-between gap-2 text-[#cccccc]">
                    <span>chat:{execution.chat_id}</span>
                    <span className="text-[#858585]">{new Date(execution.started_at).toLocaleTimeString()}</span>
                  </span>
                  <span className="mt-1 block truncate text-[#9cdcfe]">
                    {execution.trigger_type} · {execution.status}
                    {execution.current_node_id ? ` · ${execution.current_node_id}` : ""}
                  </span>
                </span>
                <ChevronRight className="mt-1 h-3.5 w-3.5 text-[#858585]" />
              </button>
            ))}
          </div>
          <div className="overflow-y-auto p-3">
            {!selectedExecution ? (
              <div className="flex h-full items-center justify-center text-[#858585]">
                Node timeline uchun execution tanlang.
              </div>
            ) : nodeRuns.length === 0 ? (
              <div className="text-[#858585]">Bu execution uchun node run topilmadi.</div>
            ) : (
              <div className="space-y-1">
                {nodeRuns.map((run) => (
                  <div key={run.id} className="grid grid-cols-[20px_1fr_auto] gap-2 rounded px-2 py-1.5 hover:bg-[#2a2d2e]">
                    <span className={cn(
                      "mt-1 h-2 w-2 rounded-full",
                      run.status === "failed" ? "bg-red-400" :
                        run.status === "waiting" ? "bg-yellow-400" :
                          run.status === "running" ? "bg-blue-400" : "bg-green-400"
                    )} />
                    <span className="min-w-0">
                      <span className="block truncate text-[#cccccc]">{run.node_id}</span>
                      <span className="block truncate text-[#858585]">{run.node_type} · attempt {run.attempt}</span>
                      {run.error ? <span className="block whitespace-pre-wrap text-red-400">{run.error}</span> : null}
                    </span>
                    <span className="text-[#858585]">{run.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
