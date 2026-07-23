import { PlusIcon } from "lucide-react";
import { CSSProperties, MouseEvent } from "react";
import { Handle, HandleType, Position } from "reactflow";
import { cn } from "@/lib/utils";

export type PillHandleTone =
  | "primary"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "accent";

interface PillHandleProps {
  id: string;
  type: HandleType;
  position: Position;
  tone?: PillHandleTone;
  title?: string;
  className?: string;
  style?: CSSProperties;
  isConnectableStart?: boolean;
  showPlus?: boolean;
}

const TONE_CLASSES: Record<PillHandleTone, string> = {
  primary: "!bg-blue-500 hover:!bg-blue-600",
  neutral: "!bg-zinc-400 hover:!bg-zinc-500",
  success: "!bg-emerald-500 hover:!bg-emerald-600",
  warning: "!bg-orange-500 hover:!bg-orange-600",
  danger: "!bg-red-500 hover:!bg-red-600",
  accent: "!bg-sky-500 hover:!bg-sky-600",
};

// Handle ni card chetidan tashqariga aniq chiqarish uchun
// 100% (o'z kengligi) + 8px qo'shimcha gap
const POSITION_TRANSFORM: Record<Position, string> = {
  [Position.Right]: "translate(calc(100% + 8px), -50%)",
  [Position.Left]: "translate(calc(-100% - 8px), -50%)",
  [Position.Top]: "translate(-50%, calc(-100% - 8px))",
  [Position.Bottom]: "translate(-50%, calc(100% + 8px))",
};

function stopClickPropagation(event: MouseEvent) {
  event.stopPropagation();
}

export function PillHandle({
  id,
  type,
  position,
  tone = "primary",
  title,
  className,
  style,
  isConnectableStart,
  showPlus,
}: PillHandleProps) {
  const isSource = type === "source";
  const shouldShowPlus = showPlus ?? isSource;

  return (
    <Handle
      type={type}
      id={id}
      position={position}
      title={title}
      data-tour={isSource ? "constructor-handle" : undefined}
      isConnectableStart={isConnectableStart}
      style={{ pointerEvents: "auto", transform: POSITION_TRANSFORM[position], ...style }}
      // React Flow starts an edge connection on mousedown. Do not stop that
      // event here; doing so prevents regular node handles from showing the
      // connection preview. Only stop click bubbling to avoid selecting the node
      // after a handle interaction.
      onClick={stopClickPropagation}
      className={cn(
        "group/handle !rounded-md !border-0 flex items-center justify-center shadow-sm",
        "!pointer-events-auto !transition-colors !duration-150 ease-out",
        "!w-4 !h-4",
        // Enlarge the drag/hit area WITHOUT overlaying a child element: a
        // ::before pseudo belongs to this Handle, so document.elementFromPoint
        // (used by React Flow to detect the handle on mousedown) still returns
        // the Handle itself. A real child <span> would be returned instead and,
        // lacking the `source`/`target` class, would block connections entirely.
        isSource &&
          "before:absolute before:-inset-3 before:content-['']",
        TONE_CLASSES[tone],
        className
      )}
    >
      {shouldShowPlus && (
        <PlusIcon
          className="pointer-events-none text-white"
          style={{ width: 12, height: 12, strokeWidth: 3 }}
        />
      )}
    </Handle>
  );
}
