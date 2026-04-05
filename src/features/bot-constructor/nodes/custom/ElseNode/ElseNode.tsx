"use client";

import { NodeProps, Position } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles } from "../../components";
import { ElseNodeData } from "./types";
import { useIsInNodePanel } from "@/features/bot-constructor/contexts/NodePanelContext";
import { Handle } from "reactflow";

const ElseNodeComponent = ({ id, data, selected }: NodeProps<ElseNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const inPanel = useIsInNodePanel();

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      {/* Input - chap tomonda (IF/ElseIf dan NEXT) */}
      {!inPanel && (
        <Handle
          type="target"
          position={Position.Left}
          id="target-handler"
          className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800"
        />
      )}

      <NodeHeader
        icon="➡️"
        title="Else (Aks holda)"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="text-sm text-muted-foreground text-center py-4 border rounded-md bg-muted/30">
            <p className="font-medium mb-2">Else node - shart yo'q</p>
            <p>
              If yoki Else If shartlari bajarilmagan bo'lsa,
              <br />
              bu yo'nalish doim ishga tushadi.
            </p>
          </div>
        </CardContent>
      )}

      <SourceHandles id="true" position={Position.Right} />
    </Card>
  );
};

export const ElseNode = memo(ElseNodeComponent);
