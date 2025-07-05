// FAYL: app/constructor/components/LogViewer/LogLine.tsx
import { memo } from "react";
import { cn } from "@/lib/utils";
import { LogEntry } from "./types";
import { Theme } from "@/constructor/data/themes";

interface LogLineProps {
  log: LogEntry;
  theme: Theme;
}

const levelColorMap: Record<
  LogEntry["level"],
  keyof Omit<Theme, "name" | "bg" | "header" | "text" | "prompt">
> = {
  INFO: "info",
  ERROR: "error",
  WARN: "warn",
  SYSTEM: "system",
};

export const LogLine = memo(({ log, theme }: LogLineProps) => {
  const levelClass = theme[levelColorMap[log.level]];
  return (
    <div className="flex">
      <span className={cn("w-20 shrink-0", theme.prompt)}>{log.timestamp}</span>
      <span className={cn("w-16 shrink-0 font-bold", levelClass)}>
        {log.level}
      </span>
      <p className={cn("whitespace-pre-wrap break-all", theme.text)}>
        {log.message}
      </p>
    </div>
  );
});
LogLine.displayName = "LogLine";
