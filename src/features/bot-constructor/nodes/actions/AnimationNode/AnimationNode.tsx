"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import ComingSoonNodeContent from "../shared/ComingSoonNodeContent";

const AnimationNodeComponent = ({ id, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="🎬" title="GIF yuborish" />
      <CardContent>
        <ComingSoonNodeContent node_description="GIF yoki MP4 animation yuboradi" />
      </CardContent>

      <SourceHandles />
    </Card>
  );
};

export const SendAnimationNode = memo(AnimationNodeComponent);
