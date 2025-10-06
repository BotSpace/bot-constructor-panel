import { Terminal, X, Trash2, Moon, Sun, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LogViewerHeaderProps } from "./types";

export const LogViewerHeader = ({
  theme,
  onThemeChange,
  onClear,
  onCopy,
  onClose,
  searchTerm,
  onSearchChange,
  logCount,
}: LogViewerHeaderProps) => (
  <header
    className={cn(
      "flex items-center justify-between p-2 pl-4 border-b shrink-0",
      theme.header
    )}
  >
    <div className="flex items-center gap-3">
      <Terminal className="w-5 h-5 text-primary" />
      <span className={cn("font-semibold", theme.text)}>
        Bot Jarayoni Loglari
      </span>
      <span className={cn("text-xs px-2 py-0.5 rounded-full", theme.bg)}>
        {logCount}
      </span>
    </div>

    <div className="flex items-center gap-1">
      <Input
        placeholder="Loglarni qidirish..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className={cn(
          "h-8 w-64 text-xs",
          theme.bg,
          theme.text,
          "focus-visible:ring-primary"
        )}
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onCopy}>
            <Copy className={cn("w-5 h-5", theme.prompt)} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Barcha loglarni nusxalash</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onClear}>
            <Trash2 className={cn("w-5 h-5", theme.prompt)} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Loglarni tozalash</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onThemeChange}>
            {theme.name === "dark" ? (
              <Sun className={cn("w-5 h-5", theme.prompt)} />
            ) : (
              <Moon className={cn("w-5 h-5", theme.prompt)} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mavzuni o'zgartirish</p>
        </TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className={cn("w-5 h-5", theme.prompt)} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Yopish (Ctrl + `)</p>
        </TooltipContent>
      </Tooltip>
    </div>
  </header>
);
