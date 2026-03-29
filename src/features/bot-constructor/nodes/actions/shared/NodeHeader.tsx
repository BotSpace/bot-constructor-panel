import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";

interface NodeHeaderProps {
  icon: ReactNode;
  title: string;
  nodeId?: string;
  buttonCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  color?: string;
}

export const NodeHeader = ({
  icon,
  title,
  buttonCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  color = "bg-zinc-600",
}: NodeHeaderProps) => {
  return (
    <div
      onClick={onToggleCollapse}
      className="relative flex flex-col items-center justify-center gap-3 px-4 py-6 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-[inherit]"
      role="button"
    >
      {/* Katta Markazlashgan Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
          // Bu yerda icon ichidagi svg o'lchamini kattalashtirdik (w-8 h-8)
          "[&_svg]:w-8 [&_svg]:h-8 [&_svg]:text-white [&_svg]:stroke-[2.5px]",
          color
        )}
      >
        {typeof icon === "string" ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          icon
        )}
      </div>

      {/* Pastdagi Title */}
      <div className="text-center">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/80">
          {title}
        </h3>
      </div>

    </div>
  );
};
