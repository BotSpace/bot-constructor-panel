"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Bug,
  Play,
  Square,
  RefreshCw,
  Search,
  Bot,
  AlertCircle,
  CheckCircle,
  Copy,
  Trash2,
} from "lucide-react";

interface DebugPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "debug";
  message: string;
  source?: string;
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  open,
  onOpenChange,
  projectId,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [hasBotToken, setHasBotToken] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");
  const logsEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Check if bot token exists on component mount
  useEffect(() => {
    if (open && projectId) {
      checkBotToken();
    }
  }, [open, projectId]);

  // Filter logs based on search term and level
  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
          log.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel !== "all") {
      filtered = filtered.filter((log) => log.level === selectedLevel);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel]);

  // Auto scroll to bottom when new logs arrive
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [filteredLogs]);

  const checkBotToken = async () => {
    try {
      // Check if bot token exists in environment variables
      const response = await fetch(`/api/projects/${projectId}/env/BOT_TOKEN`);
      if (response.ok) {
        setHasBotToken(true);
        setConnectionStatus("disconnected");
      } else {
        setHasBotToken(false);
      }
    } catch (error) {
      console.error("Error checking bot token:", error);
      setHasBotToken(false);
    }
  };

  const handleSaveBotToken = async () => {
    if (!botToken.trim()) return;

    setIsConnecting(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/env`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "BOT_TOKEN",
          value: botToken.trim(),
        }),
      });

      if (response.ok) {
        setHasBotToken(true);
        setBotToken("");
        addLog("info", "Bot token saved successfully");
      } else {
        addLog("error", "Failed to save bot token");
      }
    } catch (error) {
      addLog("error", "Error saving bot token");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleStartDebug = async () => {
    if (!hasBotToken) return;

    setIsRunning(true);
    setConnectionStatus("connecting");
    addLog("info", "Starting debug session...");

    try {
      // Start SSE connection for live logs
      const url = `https://botlarnionasi.jscorp.uz/sse/api/project/${projectId}/logs/`;
      eventSourceRef.current = new EventSource(url);

      eventSourceRef.current.onopen = () => {
        setConnectionStatus("connected");
        addLog("info", "Connected to debug server");
      };

      eventSourceRef.current.onmessage = (event) => {
        try {
          const logData = JSON.parse(event.data);
          addLog(logData.level || "info", logData.message, logData.source);
        } catch (error) {
          addLog("info", event.data);
        }
      };

      eventSourceRef.current.onerror = (error) => {
        setConnectionStatus("error");
        addLog("error", "Connection to debug server failed");
        console.error("SSE Error:", error);
      };
    } catch (error) {
      setConnectionStatus("error");
      addLog("error", "Failed to start debug session");
    }
  };

  const handleStopDebug = () => {
    setIsRunning(false);
    setConnectionStatus("disconnected");

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    addLog("info", "Debug session stopped");
  };

  const handleReload = () => {
    if (isRunning) {
      handleStopDebug();
      setTimeout(() => {
        handleStartDebug();
      }, 1000);
    }
  };

  const addLog = (
    level: LogEntry["level"],
    message: string,
    source?: string
  ) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      level,
      message,
      source,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = filteredLogs
      .map(
        (log) =>
          `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");
    navigator.clipboard.writeText(logText);
  };

  const getLogLevelColor = (level: LogEntry["level"]) => {
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
        return "text-white";
    }
  };

  const getLogLevelIcon = (level: LogEntry["level"]) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-3 h-3" />;
      case "warning":
        return <AlertCircle className="w-3 h-3" />;
      case "info":
        return <CheckCircle className="w-3 h-3" />;
      case "debug":
        return <Bug className="w-3 h-3" />;
      default:
        return null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] h-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="w-5 h-5" />
            Debug Panel
          </DialogTitle>
          <DialogDescription>
            Debug and test your bot in real-time with live logs and testing
            tools.
          </DialogDescription>
        </DialogHeader>

        {!hasBotToken ? (
          // Bot Token Setup
          <div className="space-y-4">
            <Alert>
              <Bot className="h-4 w-4" />
              <AlertDescription>
                To start debugging, you need to configure a bot token for this
                project.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div>
                <Label htmlFor="bot-token">Bot Token</Label>
                <Input
                  id="bot-token"
                  type="password"
                  placeholder="Enter your Telegram bot token..."
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Get your bot token from @BotFather on Telegram
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSaveBotToken}
                  disabled={!botToken.trim() || isConnecting}
                  className="gap-2"
                >
                  {isConnecting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Save Bot Token
                </Button>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Debug Interface
          <div className="space-y-4 flex-1">
            {/* Control Panel */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant={isRunning ? "default" : "secondary"}
                  className={
                    connectionStatus === "connected"
                      ? "bg-green-500"
                      : connectionStatus === "error"
                      ? "bg-red-500"
                      : ""
                  }
                >
                  {isRunning ? "Running" : "Stopped"}
                </Badge>
                <Badge variant="outline">
                  {connectionStatus === "connected"
                    ? "Connected"
                    : connectionStatus === "connecting"
                    ? "Connecting..."
                    : connectionStatus === "error"
                    ? "Error"
                    : "Disconnected"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Project: {projectId || "N/A"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isRunning ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleStopDebug}
                      className="gap-2"
                    >
                      <Square className="w-4 h-4" />
                      Stop
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleReload}
                      className="gap-2"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Reload
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleStartDebug}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Debug
                  </Button>
                )}
              </div>
            </div>

            {/* Log Controls */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="debug">Debug</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={copyLogs}
                className="gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={clearLogs}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            </div>

            {/* Logs Display */}
            <div className="bg-black text-white p-4 rounded-md font-mono text-sm h-80 overflow-y-auto border">
              {filteredLogs.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                  {logs.length === 0
                    ? "No logs available. Start debugging to see live logs."
                    : "No logs match your search criteria."}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2 py-1">
                      <span className="text-gray-500 text-xs w-20 flex-shrink-0">
                        {log.timestamp}
                      </span>
                      <div
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${getLogLevelColor(
                          log.level
                        )}`}
                      >
                        {getLogLevelIcon(log.level)}
                      </div>
                      <span className={`flex-1 ${getLogLevelColor(log.level)}`}>
                        {log.message}
                      </span>
                      {log.source && (
                        <span className="text-gray-500 text-xs">
                          [{log.source}]
                        </span>
                      )}
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
