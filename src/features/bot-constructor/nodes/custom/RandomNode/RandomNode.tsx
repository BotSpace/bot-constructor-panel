"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { NodeFooter } from "../../actions/shared/NodeFooter";
import { SourceHandler, TargetHandler } from "../../components";

const RandomNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />
      <NodeHeader
        icon="🎲"
        title="Tasodifiy"
        nodeId={id}
        color="bg-teal-500/10"
      />
      <div className="p-4 text-sm text-muted-foreground text-center">
        Tasodifiy yo'lni tanlaydi
      </div>
      <NodeFooter nodeId={id} />
      <SourceHandler />
    </Card>
  );
};

export const RandomNode = memo(RandomNodeComponent);
