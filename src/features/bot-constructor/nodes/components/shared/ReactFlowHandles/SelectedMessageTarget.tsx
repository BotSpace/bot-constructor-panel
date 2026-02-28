import React from "react";
import { Repeat2 } from "lucide-react";
import { Handle, Position } from "reactflow";

export function SelectedMessageTarget() {
  return (
    <Handle
      type="target"
      position={Position.Left}
      className="translate-y-8 !w-4 !h-4 !bg-orange-500 !border-2 !border-gray-800 flex items-center justify-center"
      id="selected-message-target"
      style={{ top: "50%" }}
      title="Tanlangan Xabar"
    >
      <Repeat2 size={12} className="w-2 h-2 text-white pointer-events-none" />
    </Handle>
  );
}
