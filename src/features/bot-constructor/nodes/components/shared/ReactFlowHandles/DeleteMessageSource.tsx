import React from "react";
import { Trash2 } from "lucide-react";
import { Handle, Position } from "reactflow";

export function DeleteMessageSource() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!w-4 !h-4 !bg-red-500 !border-2 !border-white/20 flex items-center justify-center"
      id="delete-message-source"
      style={{ top: "50%" }}
      title="O'chiriladigan Xabar"
    >
      <Trash2 size={12} className="w-2 h-2 text-white pointer-events-none" />
    </Handle>
  );
}
