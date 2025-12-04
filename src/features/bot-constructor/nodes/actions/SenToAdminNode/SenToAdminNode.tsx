"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandles, TargetHandles } from "../../components";

const SenToAdminNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="👤" title="Admin'ga yuborish" />
      <div className="p-4 text-sm text-muted-foreground text-center">
        Xabarni admin panelga yuboradi
      </div>
      <NodeFooter nodeId={id} />
      <SourceHandles />
    </Card>
  );
};

export const SenToAdminNode = memo(SenToAdminNodeComponent);

