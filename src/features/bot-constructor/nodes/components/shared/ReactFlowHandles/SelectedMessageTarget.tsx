import React from "react";
import { Handle, Position } from "reactflow";

export function SelectedMessageTarget() {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className="translate-y-8 !w-3 !h-3 !rounded-full !bg-orange-500/60 !border-2 !border-background hover:!bg-orange-500 hover:!scale-125 !transition-all !duration-150"
      id="selected-message-target"
      style={{ top: "50%" }}
      title="Tanlangan Xabar"
    />
  );
}
