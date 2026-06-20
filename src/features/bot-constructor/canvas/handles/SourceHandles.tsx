import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { PillHandle, PillHandleTone } from "@/features/bot-constructor/canvas/handles/PillHandle";

interface SourceHandlerProps {
  id?: string;
  position?: Position;
  className?: string;
  nodeId?: string;
  tone?: PillHandleTone;
}

/** Returns the inline style needed to centre a handle along its edge. */
function centerStyleForPosition(pos: Position): React.CSSProperties {
  if (pos === Position.Top || pos === Position.Bottom) {
    return { left: "50%" };
  }
  // Left or Right — centre vertically
  return { top: "50%" };
}

export function SourceHandles({
  id = "source-handler",
  position,
  className,
  tone = "accent",
}: SourceHandlerProps) {
  const inPanel = useIsInNodePanel();

  if (inPanel) return null;

  const resolvedPosition = position ?? Position.Right;

  return (
    <PillHandle
      id={id}
      type="source"
      position={resolvedPosition}
      tone={tone}
      className={className}
      style={centerStyleForPosition(resolvedPosition)}
    />
  );
}
