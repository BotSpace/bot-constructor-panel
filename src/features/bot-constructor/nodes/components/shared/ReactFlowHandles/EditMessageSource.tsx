import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { PillHandle } from "@/features/bot-constructor/nodes/components/shared/ReactFlowHandles/PillHandle";

export function EditMessageSource() {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <PillHandle
      id="edit-message-source"
      type="source"
      position={Position.Right}
      tone="warning"
      title="Tahrirlanadigan Xabar"
      style={{ top: "50%" }}
    />
  );
}
