import React from "react";
import { Handle, Position } from "reactflow";

export function ElseMessageSource() {
  return (
    <Handle
      type="source"
      position={Position.Right}
      className="!w-3 !h-3 !rounded-full !bg-red-500/60 !border-2 !border-background hover:!bg-red-500 hover:!scale-125 !transition-all !duration-150"
      id="else-message-source"
      style={{ top: "50%" }}
      title="Agar trigger handleriga to'g'ri kelmasa"
    />
  );
}
