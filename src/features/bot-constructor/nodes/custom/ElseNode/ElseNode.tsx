"use client";

import { NodeProps, Position, Handle } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { NodeFooter } from "../../actions/shared/NodeFooter";
import { SourceHandles } from "../../components";
import { ElseNodeData } from "./types";

const ElseNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ElseNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      {/* Input - chap tomonda (IF/ElseIf dan NEXT) */}
      <Handle
        type="target"
        position={Position.Left}
        id="target-handler"
        className="!w-4 !h-4 !bg-sky-500 !border-2 !border-gray-800"
      />

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

      <NodeFooter nodeId={id} />

      {/* TRUE - pastda (doim bajariladi) */}
      <SourceHandles id="true" position={Position.Bottom} />
    </Card>
  );
};

export const ElseNode = memo(ElseNodeComponent);
