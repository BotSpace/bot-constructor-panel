"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandler, TargetHandler } from "../../components";

const AnimationNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />
      <NodeHeader
        icon="🎬"
        title="GIF yuborish"
        nodeId={id}
        color="bg-violet-500/10"
      />
      <div className="p-4 text-sm text-muted-foreground text-center">
        GIF yoki MP4 animation yuboradi
      </div>
      <NodeFooter nodeId={id} />
      <SourceHandler />
    </Card>
  );
};

export const SendAnimationNode = memo(AnimationNodeComponent);
