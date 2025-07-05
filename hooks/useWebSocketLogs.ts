// FAYL: hooks/useWebSocketLogs.ts

import { useState, useEffect, useCallback } from "react";
import {
  LogEntry,
  LogLevel,
} from "@/app/constructor/components/LogViewer/types";

let logIdCounter = 0;

const parseLogMessage = (
  message: string
): Omit<LogEntry, "id" | "timestamp"> => {
  const upperCaseMessage = message.toUpperCase();
  if (upperCaseMessage.startsWith("ERROR:")) {
    return { level: "ERROR", message: message.substring(6).trim() };
  }
  if (upperCaseMessage.startsWith("INFO:")) {
    return { level: "INFO", message: message.substring(5).trim() };
  }
  if (upperCaseMessage.includes("UVICORN")) {
    return { level: "WARN", message };
  }
  if (message.startsWith("---")) {
    return { level: "SYSTEM", message };
  }
  return { level: "INFO", message };
};

export function useWebSocketLogs(url: string, isVisible: boolean) {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const ws = new WebSocket(url);

    const addLog = (data: Omit<LogEntry, "id" | "timestamp">) => {
      setLogs((prev) => [
        ...prev,
        {
          ...data,
          id: logIdCounter++,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    };

    ws.onopen = () =>
      addLog({ level: "SYSTEM", message: "--- Log serveriga ulanildi ---" });
    ws.onmessage = (event) => addLog(parseLogMessage(event.data.toString()));
    ws.onclose = () =>
      addLog({ level: "WARN", message: "--- Serverdan uzildi ---" });
    ws.onerror = () =>
      addLog({ level: "ERROR", message: "--- WebSocket xatoligi ---" });

    return () => {
      ws.close();
    };
  }, [url, isVisible]);

  const clearLogs = useCallback(() => setLogs([]), []);

  return { logs, clearLogs };
}
