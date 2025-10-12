"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, X, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useKeyboardShortcut } from "@/hooks/use-keyboard-shortcut";
import { cn } from "@/lib/utils";

interface LogEntry {
  timestamp: string;
  level: "info" | "error" | "warn" | "debug";
  message: string;
}

interface LogViewerProps {
  projectId: string;
  sseEndpoint?: string;
  defaultHeight?: number;
  minHeight?: number;
  maxHeight?: number;
}

export function LogViewer({
  projectId,
  sseEndpoint = `https://botlarnionasi.jscorp.uz/sse/api/project/${projectId}/logs/`,
  defaultHeight = 300,
  minHeight = 100,
  maxHeight = 800,
}: LogViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [height, setHeight] = useState(defaultHeight);
  const [isResizing, setIsResizing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const resizeStartRef = useRef({ y: 0, height: 0 });

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    if (!isOpen) return;

    const eventSource = new EventSource(sseEndpoint);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
      console.log("[v0] SSE connection established");
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const logEntry: LogEntry = {
          timestamp: new Date().toISOString(),
          level: data.level || "info",
          message: data.message || event.data,
        };
        setLogs((prev) => [...prev, logEntry]);
      } catch (error) {
        // If not JSON, treat as plain text
        const logEntry: LogEntry = {
          timestamp: new Date().toISOString(),
          level: "info",
          message: event.data,
        };
        setLogs((prev) => [...prev, logEntry]);
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      console.error("[v0] SSE connection error");
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [isOpen, sseEndpoint]);

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
      const deltaY = resizeStartRef.current.y - e.clientY;
      const newHeight = Math.min(
        Math.max(resizeStartRef.current.height + deltaY, minHeight),
        maxHeight
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, minHeight, maxHeight]);

  useKeyboardShortcut(["Control", "`"], () => {
    setIsOpen((prev) => !prev);
  });

  const clearLogs = () => setLogs([]);

  const downloadLogs = () => {
    const logText = logs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${projectId}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return "text-red-400";
      case "warn":
        return "text-yellow-400";
      case "debug":
        return "text-blue-400";
      default:
        return "text-foreground";
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-black"
      style={{ height: `${height}px` }}
    >
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/50 transition-colors",
          isResizing && "bg-blue-500"
        )}
        onMouseDown={handleMouseDown}
      />

      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Logs</span>
          <div className="flex items-center gap-1.5">
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )}
            />
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="h-7 px-2"
          >
            <Download className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearLogs}
            disabled={logs.length === 0}
            className="h-7 px-2"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-7 px-2"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div
        ref={logContainerRef}
        className="h-[calc(100%-41px)] overflow-y-auto overflow-x-auto px-4 py-2 font-mono text-xs leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Waiting for logs...
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className="flex gap-3 hover:bg-muted/5 -mx-2 px-2 py-0.5"
            >
              <span className="text-muted-foreground shrink-0">
                {new Date(log.timestamp).toLocaleTimeString("en-US", {
                  hour12: false,
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </span>
              <span
                className={cn(
                  "shrink-0 uppercase w-12",
                  getLogColor(log.level)
                )}
              >
                [{log.level}]
              </span>
              <span className="text-foreground break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
