"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { Card, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator/ButtonGenerator";
import { CallbackAnswerNodeData } from "./types";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

const CallbackAnswerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<CallbackAnswerNodeData>) => {
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader icon="↩️" title="Callback Javob" isCollapsed={isCollapsed} onToggleCollapse={() => setIsCollapsed(!isCollapsed)} />
      {!isCollapsed && (
        <>
          <div className="p-4 text-sm text-muted-foreground text-center">
            Inline tugmaga javob beradi
          </div>
          <CardFooter>
            <ButtonGenerator initialKeyboard={data.keyboard} node_id={id} />
          </CardFooter>
        </>
      )}
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const CallbackQueryAnswerNode = memo(CallbackAnswerNodeComponent);
