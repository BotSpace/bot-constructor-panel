import { Theme } from "@/constructor/data/themes";

export type LogLevel = "INFO" | "ERROR" | "WARN" | "SYSTEM";

export interface LogEntry {
  id: number;
  timestamp: string;
  level: LogLevel;
  message: string;
}

export interface LogViewerHeaderProps {
  theme: Theme;
  onThemeChange: () => void;
  onClear: () => void;
  onCopy: () => void;
  onClose: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  logCount: number;
}
