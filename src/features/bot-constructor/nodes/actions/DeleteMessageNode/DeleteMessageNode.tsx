"use client";

import { NodeProps } from "reactflow";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandler, TargetHandler } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface DeleteMessageNodeData {
  messageId?: number;
  deleteFromContext?: boolean;
}

const DeleteMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<DeleteMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleUpdate = (update: Partial<DeleteMessageNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />
      <NodeHeader
        icon="🗑️"
        title="Xabarni o'chirish"
        nodeId={id}
        color="bg-red-500/10"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <Label>Contextdan xabarni o'chirish</Label>
            <Switch
              checked={data.deleteFromContext || false}
              onCheckedChange={(checked) =>
                handleUpdate({ deleteFromContext: checked })
              }
            />
          </div>

          {!data.deleteFromContext && (
            <div className="flex flex-col gap-2">
              <Label>Xabar ID</Label>
              <Input
                type="number"
                placeholder="O'chiriladigan xabar ID"
                value={data.messageId || ""}
                onChange={(e) =>
                  handleUpdate({ messageId: parseInt(e.target.value) || undefined })
                }
              />
              <p className="text-xs text-muted-foreground">
                O'chiriladigan xabarning ID raqamini kiriting
              </p>
            </div>
          )}
        </CardContent>
      )}

      <NodeFooter nodeId={id} />
      <SourceHandler />
    </Card>
  );
};

export const DeleteMessageNode = memo(DeleteMessageNodeComponent);

