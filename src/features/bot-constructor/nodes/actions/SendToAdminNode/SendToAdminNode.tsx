"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

const SendToAdminNodeComponent = ({ id, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="👤" title="Admin'ga yuborish" />
      <div className="p-4 text-sm text-muted-foreground text-center">
        Xabarni admin panelga yuboradi
      </div>
      
      {/* Handler list */}
      <HandlersList sourceNodeId={id} />

      <SourceHandles />
    </Card>
  );
};

export const SendToAdminNode = memo(SendToAdminNodeComponent);
