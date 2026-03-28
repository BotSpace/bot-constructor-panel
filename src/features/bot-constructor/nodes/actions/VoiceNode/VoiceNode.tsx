"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import ComingSoonNodeContent from "../shared/ComingSoonNodeContent";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

const VoiceNodeComponent = ({ id, data, selected }: NodeProps) => {
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="🎤" title="Ovozli xabar" />
      <ComingSoonNodeContent node_description="Voice message yuboradi" />

      {/* Handler list */}
      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendVoiceNode = memo(VoiceNodeComponent);
