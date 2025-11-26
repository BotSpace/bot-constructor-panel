"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandler, TargetHandler } from "../../components";

const PinMessageNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />
      <NodeHeader
        icon="📌"
        title="Xabarni qadash"
        nodeId={id}
        color="bg-lime-500/10"
      />
      <div className="p-4 text-sm text-muted-foreground text-center">
        Xabarni guruhda qadab qo'yadi
      </div>
      <NodeFooter nodeId={id} />
      <SourceHandler />
    </Card>
  );
};

export const PinMessageNode = memo(PinMessageNodeComponent);
