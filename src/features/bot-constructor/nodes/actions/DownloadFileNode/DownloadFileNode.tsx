"use client";

import { NodeProps, useNodes, useEdges } from "reactflow";
import { memo, useMemo, useEffect } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import { HandlerData } from "../TextMessageNode/types";

export interface DownloadFileNodeData {
  messageType?: string; // Type of message from MessageTrigger (photo, video, audio, document)
  handlers?: HandlerData[];
}

const DownloadFileNodeInternal = ({
  id,
  data,
  selected,
}: NodeProps<DownloadFileNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const nodes = useNodes();
  const edges = useEdges();

  const handleUpdate = (update: Partial<DownloadFileNodeData>) => {
    updateNodeData(id, update);
  };

  // Find the parent MessageTrigger node
  const parentMessageTrigger = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return null;

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode || parentNode.type !== "MessageTriggerNode") return null;

    const parentData = parentNode.data as any;
    const messageType = parentData.type;

    // Check if MessageTrigger handles file types
    const supportedTypes = ["photo", "video", "audio", "document"];
    if (!supportedTypes.includes(messageType)) return null;

    return {
      node: parentNode,
      data: parentData,
      messageType,
    };
  }, [nodes, edges, id]);

  // Update messageType when parent MessageTrigger changes
  useEffect(() => {
    if (
      parentMessageTrigger &&
      parentMessageTrigger.messageType !== data.messageType
    ) {
      handleUpdate({
        messageType: parentMessageTrigger.messageType,
      });
    }
  }, [parentMessageTrigger, data.messageType]);

  // Determine file ID field based on message type (for display only)
  const fileIdField = useMemo(() => {
    const messageType = parentMessageTrigger?.messageType || data.messageType;
    if (!messageType) return null;

    switch (messageType) {
      case "photo":
        return "photo_file_id";
      case "video":
        return "video_file_id";
      case "audio":
        return "audio_file_id";
      case "document":
        return "file_id";
      default:
        return null;
    }
  }, [parentMessageTrigger, data.messageType]);

  // Get display name for message type
  const getMessageTypeLabel = (type?: string) => {
    switch (type) {
      case "photo":
        return "Rasm";
      case "video":
        return "Video";
      case "audio":
        return "Audio";
      case "document":
        return "Fayl";
      default:
        return "Noma'lum";
    }
  };

  const isConfigured = !!parentMessageTrigger && !!data.messageType;

  return (
    <Card className={cn("w-[150px] h-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <NodeHeader
        icon="📥"
        title="Fayl yuklab olish"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <CardContent className="space-y-4">
          {!parentMessageTrigger ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bu node MessageTrigger'dan keyin kelishi kerak va MessageTrigger
                audio, video, photo yoki file turlarini handle qilishi kerak.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Xabar turi</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {getMessageTypeLabel(parentMessageTrigger.messageType)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-gray-400">Fayl ID maydoni</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {fileIdField}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  Foydalanuvchi yuborgan{" "}
                  {getMessageTypeLabel(
                    parentMessageTrigger.messageType
                  ).toLowerCase()}{" "}
                  uchun ID saqlanadi
                </p>
              </div>
            </>
          )}
        </CardContent>
      )}

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const DownloadFileNode = memo(DownloadFileNodeInternal);
