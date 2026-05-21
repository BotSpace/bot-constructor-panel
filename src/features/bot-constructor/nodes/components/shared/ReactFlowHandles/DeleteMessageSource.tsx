import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { PillHandle } from "./PillHandle";

export function DeleteMessageSource() {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <PillHandle
      id="delete-message-source"
      type="source"
      position={Position.Right}
      tone="danger"
      title="O'chiriladigan Xabar"
      style={{ top: "50%" }}
    />
  );
}
