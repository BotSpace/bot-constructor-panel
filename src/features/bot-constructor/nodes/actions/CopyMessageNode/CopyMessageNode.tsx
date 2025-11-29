"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";

const CopyMessageNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📋"
        title="Xabarni nusxalash"
        nodeId={id}
        color="bg-amber-500/10"
      />
      <div className="p-4 text-sm text-muted-foreground text-center">
        Xabarni nusxalab yuboradi
      </div>
      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const CopyMessageNode = memo(CopyMessageNodeComponent);
