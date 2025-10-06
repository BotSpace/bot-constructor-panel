// FAYL: app/constructor/components/LogViewer/LogList.tsx
import { useEffect, useRef } from "react";
import { LogEntry } from "./types";
import { LogLine } from "./LogLine";
import { Theme } from "@/constructor/data/themes";

interface LogListProps {
  logs: LogEntry[];
  theme: Theme;
  searchTerm: string;
}

export const LogList = ({ logs, theme, searchTerm }: LogListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div
      ref={scrollRef}
      className="flex-grow p-4 overflow-y-auto font-mono text-xs"
    >
      {logs.length > 0 ? (
        logs.map((log) => <LogLine key={log.id} log={log} theme={theme} />)
      ) : (
        <div className="flex items-center justify-center h-full">
          <p className={theme.prompt}>
            {searchTerm ? "Hech narsa topilmadi." : "Loglar kutilmoqda..."}
          </p>
        </div>
      )}
    </div>
  );
};
