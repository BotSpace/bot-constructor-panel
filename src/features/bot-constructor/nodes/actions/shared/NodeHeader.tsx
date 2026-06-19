import { ReactNode, useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { useFlowStore } from "@/features/bot-constructor/store";

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
  /** Node id — required for inline name editing. */
  nodeId: string;
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

// ---------------------------------------------------------------------------
// InlineNodeTitle — double-click to edit the node name inline on the canvas.
// Saves to data.node_label via updateNodeData; Esc reverts, Enter/blur saves.
// ---------------------------------------------------------------------------

interface InlineNodeTitleProps {
  nodeId: string;
  /** Displayed title (already resolved: custom label or manifest default). */
  title: string;
  /** Default/fallback title to restore when user clears the input. */
  defaultTitle: string;
  className?: string;
}

function InlineNodeTitle({ nodeId, title, defaultTitle, className }: InlineNodeTitleProps) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const startEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // don't trigger onToggleCollapse
    setDraft(title);
    setEditing(true);
    // Focus is set via the autoFocus attribute on the input element
  }, [title]);

  const commit = useCallback(() => {
    const trimmed = draft.trim();
    // Empty → revert to default (clear node_label so manifest title shows)
    const next = trimmed === "" || trimmed === defaultTitle ? "" : trimmed;
    updateNodeData(nodeId, { node_label: next || null });
    setEditing(false);
  }, [draft, defaultTitle, nodeId, updateNodeData]);

  const cancel = useCallback(() => {
    setEditing(false);
  }, []);

  if (editing) {
    return (
      <input
        // nodrag prevents React Flow from starting a node drag while the input is focused
        className={cn(
          "nodrag",
          "w-full bg-transparent text-center text-sm font-semibold tracking-wide uppercase",
          "text-foreground/80 outline-none border-b border-primary/60 focus:border-primary",
          "pb-0.5 leading-tight",
          className
        )}
        value={draft}
        autoFocus
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            cancel();
          }
          // Prevent React Flow keyboard shortcuts while typing
          e.stopPropagation();
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        // Allow text selection inside input without triggering drag
        style={{ minWidth: 0, maxWidth: "100%" }}
      />
    );
  }

  return (
    <h3
      className={cn(
        "text-sm font-semibold tracking-wide uppercase text-foreground/80 cursor-text select-none",
        "hover:text-foreground transition-colors",
        className
      )}
      onDoubleClick={startEdit}
      title="Double-click to rename"
    >
      {title}
    </h3>
  );
}

export const NodeHeader = ({
  icon,
  title,
  nodeId,
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

  // We need the manifest default title to know when to clear node_label.
  // The `title` prop is already resolved (node_label takes priority in
  // GenericNodeRenderer), so we pass `title` as defaultTitle too — the
  // InlineNodeTitle will only clear node_label when the trimmed value equals
  // the current displayed title or is empty, which is the correct heuristic
  // (the user is effectively "resetting" to the manifest name by clearing).
  const defaultTitle = title;

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

      {/* Pastdagi Title — inline editable */}
      <div className="text-center flex flex-col items-center gap-1.5 w-full px-2">
        <InlineNodeTitle
          nodeId={nodeId}
          title={title}
          defaultTitle={defaultTitle}
        />
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
