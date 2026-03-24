import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";

interface NodeHeaderProps {
  /** Node icon (Lucide component or emoji) */
  icon: ReactNode;
  /** Node title */
  title: string;
  /** Node ID (optional, unused but kept for API compat) */
  nodeId?: string;
  /** Number of keyboard buttons configured */
  buttonCount?: number;
  /** Whether node body is collapsed */
  isCollapsed?: boolean;
  /** Called when header is clicked */
  onToggleCollapse?: () => void;
  /** Tailwind bg class for the icon square, e.g. "bg-sky-500" */
  color?: string;
}

export const NodeHeader = ({
  icon,
  title,
  buttonCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  color = "bg-sky-500",
}: NodeHeaderProps) => {
  return (
    <div
      onClick={onToggleCollapse}
      className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-[inherit]"
      role="button"
    >
      {/* N8n-style colored icon box */}
      <div
        className={cn(
          "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
          "[&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-white [&_svg]:stroke-white",
          color
        )}
      >
        {typeof icon === "string" ? (
          <span className="text-sm leading-none">{icon}</span>
        ) : (
          icon
        )}
      </div>

      {/* Title */}
      <span className="flex-1 text-sm font-medium leading-none truncate">
        {title}
      </span>

      {/* Right: button count badge + collapse chevron */}
      <div className="flex items-center gap-1.5 shrink-0">
        {buttonCount > 0 && (
          <Badge
            variant="secondary"
            className="h-4 px-1.5 text-[10px] font-normal gap-0.5"
          >
            <LayoutGrid className="w-2.5 h-2.5" />
            {buttonCount}
          </Badge>
        )}
        {onToggleCollapse && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
              isCollapsed && "-rotate-90"
            )}
          />
        )}
      </div>
    </div>
  );
};
