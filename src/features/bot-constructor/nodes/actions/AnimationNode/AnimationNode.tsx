"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import ComingSoonNodeContent from "../shared/ComingSoonNodeContent";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const AnimationNodeComponent = ({ id, selected }: NodeProps) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="🎬" title="GIF yuborish" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        color="bg-fuchsia-500"
      />
      {!isCollapsed && (
        <CardContent>
          <ComingSoonNodeContent node_description="GIF yoki MP4 animation yuboradi" />
        </CardContent>
      )}
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendAnimationNode = memo(AnimationNodeComponent);
