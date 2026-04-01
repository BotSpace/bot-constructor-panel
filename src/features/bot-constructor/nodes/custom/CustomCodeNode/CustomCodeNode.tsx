"use client";

import React from "react";
import { NodeProps } from "reactflow";
import { CustomCodeNodeData } from "./types";
import { CodeEditorDialog } from "./components/CodeEditorDialog";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { Card, CardContent } from "@/components/ui/card";
import { SourceHandles, TargetHandles } from "../../components";

const BOT_GLOBALS = ["message", "user", "state"];

export const CustomCodeNode = ({ id, data, selected }: NodeProps<CustomCodeNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleCodeChange = (newCode: string) => {
    updateNodeData(id, { ...data, jsCode: newCode });
  };

  return (
    <Card className={`w-[150px] min-h-[150px] shadow-lg overflow-hidden ${selected ? "ring-2 ring-yellow-500/60 border-yellow-500/60" : "border-border"}`}>
      <TargetHandles />

      <NodeHeader
        title="JS Script"
        icon="💻"
        nodeId={id}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="px-3 pb-4 pt-0 space-y-3">
          <div className="bg-muted/40 p-2 rounded-md border border-dashed border-muted-foreground/20">
            <pre className="text-[10px] w-full overflow-hidden truncate opacity-70">
              {data.jsCode?.slice(0, 60) || "// JS kod yozilmagan"}
            </pre>
          </div>

          <CodeEditorDialog
            code={data.jsCode || ""}
            onChange={handleCodeChange}
            globals={BOT_GLOBALS}
          />
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};
