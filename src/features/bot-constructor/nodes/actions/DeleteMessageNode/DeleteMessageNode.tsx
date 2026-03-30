"use client";

import { NodeProps, useNodes, useEdges } from "reactflow";
import { memo, useMemo } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import {
  SourceHandles,
  TargetHandles,
  DeleteMessageSource,
} from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AlertCircle } from "lucide-react";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { HandlerData } from "../TextMessageNode/types";

export interface DeleteMessageNodeData {
  deleteFromContext?: boolean;
  handlers?: HandlerData[];
}

const DeleteMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<DeleteMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const nodes = useNodes();
  const edges = useEdges();

  const handleUpdate = (update: Partial<DeleteMessageNodeData>) => {
    updateNodeData(id, update);
  };

  // DeleteMessageHandler'dan chiqqan edge orqali DeleteMessageTarget'ga ulangan message node'ni topish
  const connectedMessageNode = useMemo(() => {
    // DeleteMessageHandler'dan chiqqan edge'ni topish
    const deleteHandlerEdge = edges.find(
      (edge) =>
        edge.source === id && edge.sourceHandle === "delete-message-source"
    );
    if (!deleteHandlerEdge) return null;

    // Shu edge'ning target node'i (DeleteMessageTarget'ga ulangan message node)
    const targetNode = nodes.find(
      (node) => node.id === deleteHandlerEdge.target
    );
    return targetNode;
  }, [nodes, edges, id]);

  const deleteFromContext = data.deleteFromContext || false;
  const isConfigured = deleteFromContext || !!connectedMessageNode;

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      {/* Custom Delete Source Handle (Right side) - O'chiriladigan messageni tanlash uchun */}
      <DeleteMessageSource />

      <NodeHeader
        icon="🗑️"
        title="Xabarni o'chirish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-center justify-between">
            <Label>Contextdan xabarni o'chirish</Label>
            <Switch
              checked={deleteFromContext}
              onCheckedChange={(checked) =>
                handleUpdate({ deleteFromContext: checked })
              }
            />
          </div>

          {!deleteFromContext && (
            <div className="flex flex-col gap-2">
              {connectedMessageNode ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    Xabar ulangan:{" "}
                    {connectedMessageNode.type === "SendTextMessageNode"
                      ? "Matn xabari"
                      : connectedMessageNode.type === "SendPhotoNode"
                        ? "Rasm xabari"
                        : connectedMessageNode.type === "SendVideoNode"
                          ? "Video xabari"
                          : connectedMessageNode.type === "SendAudioNode"
                            ? "Audio xabari"
                            : connectedMessageNode.type === "SendFileNode"
                              ? "Fayl xabari"
                              : "Xabar"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>O'chiriladigan xabarni edge orqali ulang</span>
                </div>
              )}
            </div>
          )}

          {!isConfigured && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
              <AlertCircle className="h-4 w-4" />
              <span>
                Xabarni o'chirish uchun context yoki edge orqali xabar
                tanlanishi kerak
              </span>
            </div>
          )}
        </CardContent>
      )}
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const DeleteMessageNode = memo(DeleteMessageNodeComponent);
