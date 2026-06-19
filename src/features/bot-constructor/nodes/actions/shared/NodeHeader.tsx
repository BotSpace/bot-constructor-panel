import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";

// ---------------------------------------------------------------------------
// Category badge helpers — maps manifest `category` to a short label + style.
// Uses CSS variables via Tailwind so it works in both light and dark themes.
// ---------------------------------------------------------------------------

const CATEGORY_BADGE_CONFIG: Record<string, { label: string; className: string }> = {
  triggers: {
    label: "trigger",
    className: "bg-blue-500/15 text-blue-500 border-blue-500/30",
  },
  actions: {
    label: "action",
    className: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  },
  messageOperations: {
    label: "action",
    className: "bg-slate-500/15 text-slate-500 border-slate-500/30",
  },
  flowControl: {
    label: "logic",
    className: "bg-violet-500/15 text-violet-500 border-violet-500/30",
  },
  customLogic: {
    label: "logic",
    className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30",
  },
  integrations: {
    label: "integration",
    className: "bg-indigo-500/15 text-indigo-500 border-indigo-500/30",
  },
  ai: {
    label: "ai",
    className: "bg-violet-600/15 text-violet-600 border-violet-600/30",
  },
  ai_tools: {
    label: "tool",
    className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  },
};

/** Returns badge config based on `category` and, for accessory nodes, `accessoryAttachesTo`. */
function getCategoryBadge(
  category: string,
  accessory?: boolean,
  accessoryAttachesTo?: string[]
): { label: string; className: string } | null {
  if (accessory) {
    if (accessoryAttachesTo?.includes("ai_tool")) {
      return { label: "tool", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" };
    }
    if (accessoryAttachesTo?.includes("ai_model")) {
      return { label: "provider", className: "bg-sky-500/15 text-sky-600 border-sky-500/30" };
    }
  }
  return CATEGORY_BADGE_CONFIG[category] ?? null;
}

interface NodeHeaderProps {
  icon: ReactNode;
  title: string;
  buttonCount?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  color?: string;
  /** Node category from the manifest — drives the category badge. */
  category?: string;
  /** True when this is an accessory (provider/tool) node. */
  accessory?: boolean;
  /** Accessory port types this node attaches to (e.g. ["ai_tool"]). */
  accessoryAttachesTo?: string[];
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
  category,
  accessory,
  accessoryAttachesTo,
  handleSlot,
}: NodeHeaderProps) => {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  const badgeConfig = category
    ? getCategoryBadge(category, accessory, accessoryAttachesTo)
    : null;

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

      {/* Pastdagi Title — read-only on canvas; edit via detail panel */}
      <div className="text-center flex flex-col items-center gap-1.5 w-full px-2">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-foreground/80 select-none">
          {title}
        </h3>
        {badgeConfig && (
          <Badge
            className={cn(
              "text-[9px] font-semibold tracking-widest uppercase px-1.5 py-0 h-4 pointer-events-none",
              badgeConfig.className
            )}
          >
            {badgeConfig.label}
          </Badge>
        )}
      </div>

    </div>
  );
};
