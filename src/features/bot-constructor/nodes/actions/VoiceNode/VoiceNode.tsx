"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import ComingSoonNodeContent from "../shared/ComingSoonNodeContent";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const VoiceNodeComponent = ({ id, data, selected }: NodeProps) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="🎤" title="Ovozli xabar" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} 
        color="bg-violet-500"
      />
      {!isCollapsed && (
        <>
          <ComingSoonNodeContent node_description="Voice message yuboradi" />
        </>
      )}
      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendVoiceNode = memo(VoiceNodeComponent);
