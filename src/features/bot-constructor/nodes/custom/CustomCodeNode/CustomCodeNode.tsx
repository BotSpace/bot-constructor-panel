"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { CustomCodeNodeData } from "./types";
import { CodeEditorDialog } from "./components/CodeEditorDialog";
import { useFlowStore } from "@/features/bot-constructor/store";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { Code2 } from "lucide-react";

// Botda ishlatiladigan maxsus global o'zgaruvchilar
const BOT_GLOBALS = ["message", "user", "state"];

export const CustomCodeNode = ({ id, data }: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);

  const handleCodeChange = (newCode: string) => {
    updateNodeData(id, { ...data, code: newCode });
  };

  return (
    <div className="min-w-[250px] bg-background border-2 border-yellow-500/50 rounded-xl shadow-lg overflow-hidden">
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-yellow-500"
      />

      <NodeHeader
        title="JS Script"
        icon={<Code2 className="w-4 h-4 text-yellow-500" />}
        nodeId={id}
      />

      <div className="p-4 space-y-3">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
          Mantiqiy amallar (JavaScript)
        </p>

        <div className="bg-secondary/30 p-2 rounded-md border border-dashed border-muted-foreground/20">
          <pre className="text-[10px] w-full overflow-hidden truncate opacity-70">
            {data.jsCode?.slice(0, 30) || "// Bu yerga JS kod yoziladi..."}
          </pre>
        </div>

        <CodeEditorDialog
          code={data.jsCode || ""}
          onChange={handleCodeChange}
          globals={BOT_GLOBALS}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-yellow-500"
      />
    </div>
  );
};
