"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const PinMessageNodeComponent = ({ id, data, selected }: NodeProps) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="📌" title="Xabarni qadash" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        color="bg-slate-600"
      />
      {!isCollapsed && (
        <>
          <div className="p-4 text-sm text-muted-foreground text-center">
            Xabarni guruhda qadab qo'yadi
          </div>
        </>
      )}
      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const PinMessageNode = memo(PinMessageNodeComponent);
