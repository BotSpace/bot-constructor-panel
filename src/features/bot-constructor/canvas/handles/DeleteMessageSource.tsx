import React from "react";
import { Position } from "reactflow";
import { useIsInNodePanel } from "@/features/bot-constructor/hooks/NodePanelContext";
import { PillHandle } from "@/features/bot-constructor/canvas/handles/PillHandle";

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
      // source-default markazda (50%) turadi; bu ikkinchi (reference) source uni
      // bosib qolmasligi uchun markazdan 24px pastga (pill 16px → kafolatli ajraladi).
      style={{ top: "calc(50% + 24px)" }}
    />
  );
}
