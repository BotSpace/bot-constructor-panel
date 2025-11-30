import React from "react";
import { PlusIcon } from "lucide-react";
import { Handle, Position } from "reactflow";

export function ElseMessageSource() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!w-4 !h-4 bg-red-500 !border-2 !border-gray-800 flex items-center justify-center"
      id="else-message-source"
      style={{ top: "50%" }}
      title="Agar trigger handleriga to'g'ri kelmasa"
    >
      <PlusIcon size={12} className="w-2 h-2 text-white pointer-events-none" />
    </Handle>
  );
}
