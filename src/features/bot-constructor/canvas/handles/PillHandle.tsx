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

function stopPropagation(event: MouseEvent) {
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
  const hasExpandedStartArea = isSource && position === Position.Right;

  return (
    <Handle
      type={type}
      id={id}
      position={position}
      title={title}
      isConnectableStart={isConnectableStart}
      style={{ transform: POSITION_TRANSFORM[position], ...style }}
      onClick={stopPropagation}
      onMouseDown={stopPropagation}
      onMouseUp={stopPropagation}
      className={cn(
        "group/handle !rounded-md !border-0 flex items-center justify-center shadow-sm",
        "!transition-colors !duration-150 ease-out",
        "!w-4 !h-4",
        TONE_CLASSES[tone],
        className
      )}
    >
      {hasExpandedStartArea && (
        <span aria-hidden className="absolute -inset-2" />
      )}
      {shouldShowPlus && (
        <PlusIcon
          className="pointer-events-none text-white"
          style={{ width: 12, height: 12, strokeWidth: 3 }}
        />
      )}
    </Handle>
  );
}
