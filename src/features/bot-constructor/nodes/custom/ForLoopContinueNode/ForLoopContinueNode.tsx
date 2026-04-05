"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { TargetHandles } from "../../components";
import { ForLoopContinueNodeData } from "./types";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const ForLoopContinueNodeComponent = ({
  selected,
}: NodeProps<ForLoopContinueNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="↩️" title="Loop Continue" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        color="bg-purple-600"
      />
      {!isCollapsed && (
        <div className="px-4 pb-4 text-sm text-muted-foreground text-center">
          Loop iteratsiyasini tugatadi va keyingi elementga o'tadi
        </div>
      )}
    </Card>
  );
};

export const ForLoopContinueNode = memo(ForLoopContinueNodeComponent);
