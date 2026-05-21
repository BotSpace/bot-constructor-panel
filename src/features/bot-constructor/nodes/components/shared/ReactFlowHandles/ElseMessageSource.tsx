import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { PillHandle } from "./PillHandle";

export function ElseMessageSource() {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <PillHandle
      id="else-message-source"
      type="source"
      position={Position.Right}
      tone="danger"
      title="Agar trigger handleriga to'g'ri kelmasa"
      style={{ top: "50%" }}
    />
  );
}
