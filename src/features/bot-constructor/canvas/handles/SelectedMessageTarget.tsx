import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { PillHandle } from "@/features/bot-constructor/canvas/handles/PillHandle";

export function SelectedMessageTarget() {
  const inPanel = useIsInNodePanel();
  if (inPanel) return null;

  return (
    <PillHandle
      id="selected-message-target"
      type="target"
      position={Position.Left}
      tone="warning"
      title="Tanlangan Xabar"
      showPlus={false}
      style={{ top: 120 }}
    />
  );
}
