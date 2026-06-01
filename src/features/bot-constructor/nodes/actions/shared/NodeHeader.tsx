import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";

interface NodeHeaderProps {
  icon: ReactNode;
  title: string;
  nodeId?: string;
  buttonCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  color?: string;
  /**
   * Optional handle slot rendered inside the header container.
   * Use this to anchor the main source handle to the header's vertical
   * midpoint so it does not drift toward the card centre when the card
   * is taller than the header (e.g. nodes with handler-button rows below).
   */
  handleSlot?: ReactNode;
}

export const NodeHeader = ({
  icon,
  title,
  buttonCount = 0,
  isCollapsed = false,
  onToggleCollapse,
  color = "bg-zinc-600",
  handleSlot,
}: NodeHeaderProps) => {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <div
      onClick={onToggleCollapse}
      className="relative flex flex-col items-center justify-center gap-3 px-4 py-6 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-[inherit]"
      role="button"
    >
      {/* Handle anchored to this header container so React Flow measures
          it relative to the header midpoint, not the full card centre. */}
      {handleSlot}
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
