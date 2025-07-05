// FAYL: app/constructor/components/LogViewer/OpenButton.tsx
import { Terminal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const OpenButton = ({ onClick }: { onClick: () => void }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className="fixed bottom-5 right-5 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-transform hover:scale-105 z-40"
        >
          <Terminal className="w-6 h-6" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p>Loglarni ochish (Ctrl + `)</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);
