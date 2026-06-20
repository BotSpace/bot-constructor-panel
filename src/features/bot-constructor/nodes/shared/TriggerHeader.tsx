import React, { useMemo, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { ConstructorData } from "@/features/bot-constructor/data";
import { cn } from "@/lib/utils";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";

interface TriggerHeaderProps {
  /** Trigger icon (React component or emoji string) */
  icon?: ReactNode;
  /** Trigger title */
  title?: string;
  /** Whether the body is expanded */
  isExpanded?: boolean;
  /** Whether the trigger is fully configured */
  isConfigured?: boolean;
  /** MessageTrigger data type for badge */
  dataType?: string;
  /** Called when header is clicked */
  onToggle?: () => void;
}

export const TriggerHeader = ({
  icon,
  title = "Trigger",
  isExpanded = false,
  isConfigured = false,
  dataType,
  onToggle,
}: TriggerHeaderProps) => {
  const selectedTypeData = useMemo(() => {
    if (!dataType) return null;
    return ConstructorData.MessageTypes.find((t) => t.value === dataType);
  }, [dataType]);

  const inPanel = useIsInNodePanel();
  const TypeIcon = selectedTypeData?.icon;

  if (inPanel) return null;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === "string") {
      return <span className="text-sm leading-none">{icon}</span>;
    }
    return icon;
  };

  return (
    <div
      onClick={onToggle}
      data-node-header
      className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer select-none hover:bg-muted/40 transition-colors rounded-t-[inherit]"
      role="button"
    >
      {/* N8n-style trigger icon box — amber-700 via CSS */}
      <div className="node-icon-box w-7 h-7 rounded-md flex items-center justify-center shrink-0 bg-amber-700 [&_svg]:w-4 [&_svg]:h-4 [&_svg]:text-white [&_svg]:stroke-white">
        {renderIcon()}
      </div>

      {/* Title + optional type sub-label */}
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium leading-none block truncate">
          {title}
        </span>
        {TypeIcon && (
          <div className="flex items-center gap-1 mt-0.5">
            <TypeIcon className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground truncate">
              {selectedTypeData?.label}
            </span>
          </div>
        )}
      </div>

      {/* Config status dot + chevron */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full transition-colors",
            isConfigured
              ? "bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]"
              : "bg-muted-foreground/30"
          )}
          title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
        />
        {onToggle && (
          <ChevronDown
            className={cn(
              "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )}
          />
        )}
      </div>
    </div>
  );
};
