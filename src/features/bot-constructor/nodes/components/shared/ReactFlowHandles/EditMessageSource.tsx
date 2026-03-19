import React from "react";
import { PencilIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

export function EditMessageSource() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!w-4 !h-4 !bg-orange-500 !border-2 !border-white/20 flex items-center justify-center"
      id="edit-message-source"
      style={{ top: "50%" }}
      title="Tahrirlanadigan Xabar"
    >
      <PencilIcon
        size={12}
        className="w-2 h-2 text-white pointer-events-none"
      />
    </Handle>
  );
}
