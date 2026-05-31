import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { PillHandle, PillHandleTone } from "./PillHandle";

interface SourceHandlerProps {
  id?: string;
  position?: Position;
  className?: string;
  nodeId?: string;
  tone?: PillHandleTone;
}

// NodeHeader balandligi taxminan 75-80px (icon markazi).
// Asosiy source handle ni shu darajada anchor qilamiz, shunda
// tagidagi tugma handlelari bilan to'qnashmaydi.
const MAIN_SOURCE_TOP_OFFSET = 78;

export function SourceHandles({
  id = "source-handler",
  position,
  className,
  tone = "accent",
}: SourceHandlerProps) {
  const inPanel = useIsInNodePanel();

  if (inPanel) return null;

  return (
    <PillHandle
      id={id}
      type="source"
      position={position ?? Position.Right}
      tone={tone}
      className={className}
      style={{ top: MAIN_SOURCE_TOP_OFFSET }}
    />
  );
}
