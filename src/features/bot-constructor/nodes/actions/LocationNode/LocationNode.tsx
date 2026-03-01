"use client";

import { NodeProps } from "reactflow";
import { memo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendLocationNodeData } from "./types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ActionPanel } from "../../components/shared/ActionPanel";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";

const LocationNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendLocationNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

  const handleUpdate = (update: Partial<SendLocationNodeData>) => {
    updateNodeData(id, update);
  };

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📍"
        title="Joylashuv"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label>Latitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="41.311151"
                value={data.latitude || ""}
                onChange={(e) =>
                  handleUpdate({ latitude: parseFloat(e.target.value) })
                }
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>Longitude</Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="69.279737"
                value={data.longitude || ""}
                onChange={(e) =>
                  handleUpdate({ longitude: parseFloat(e.target.value) })
                }
              />
            </div>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex flex-col gap-2">
        <ActionPanel keyboard={data.keyboard} id={id} recipients={data.recipients ?? { sendToSender: true, additionalIds: [] }} />
      </CardFooter>

      {/* Handler list */}
      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />

      <SourceHandles />
    </Card>
  );
};

export const SendLocationNode = memo(LocationNodeComponent);
