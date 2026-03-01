"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import ComingSoonNodeContent from "../shared/ComingSoonNodeContent";

const VideoNoteNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="📹" title="Video xabar" />
      <ComingSoonNodeContent node_description="Dumaloq video xabar yuboradi" />

      {/* Handler list */}

      <SourceHandles />
    </Card>
  );
};

export const SendVideoNoteNode = memo(VideoNoteNodeComponent);
