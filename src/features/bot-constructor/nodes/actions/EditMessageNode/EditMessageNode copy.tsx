import { useState, memo, useMemo, useEffect } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edit, AlertCircle } from "lucide-react";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { EditMessageNodeData, MessageIdSource } from "./types";
import { EditMessageSource } from "../../components/shared/ReactFlowHandles/EditMessageSource";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextareaAutosize from "react-textarea-autosize";
import { KeyboardConfig } from "../TextMessageNode/types";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator";
import { Badge } from "@/components/ui/badge";

export const EditMessageNode = memo(
  ({ id, data, selected, isConnectable }: NodeProps<EditMessageNodeData>) => {
    const [isEnableEditThisMessage, setIsEnableEditThisMessage] =
      useState(false);

    const [isCollapsed, setIsCollapsed] = useState(false);
    const updateNodeData = useFlowStore((state) => state.updateNodeData);
    const nodes = useNodes();
    const edges = useEdges();

    // Ma'lumotlarni yangilash funksiyasi
    const handleUpdate = (update: Partial<EditMessageNodeData>) => {
      updateNodeData(id, update);
    };

    // EditMessageHandler'dan chiqqan edge orqali EditMessageTarget'ga ulangan message node'ni topish
    const connectedMessageNode = useMemo(() => {
      // EditMessageHandler'dan chiqqan edge'ni topish (source === id && sourceHandle === "edit-message-source")
      const editHandlerEdge = edges.find(
        (edge) =>
          edge.source === id && edge.sourceHandle === "edit-message-source"
      );
      if (!editHandlerEdge) return null;

      // Shu edge'ning target node'i (EditMessageTarget'ga ulangan message node)
      const targetNode = nodes.find(
        (node) => node.id === editHandlerEdge.target
      );
      return targetNode;
    }, [nodes, edges, id]);

    // Message ID source tanlash
    const messageIdSource = data.messageIdSource || "connected_node";

    // Connected message node mavjudligini tekshirish
    const hasConnectedNode = !!connectedMessageNode;

    // Connected message node'dan ma'lumotlarni olish (avtomatik to'ldirish uchun)
    const connectedNodeData = connectedMessageNode?.data as any;

    return (
      <Card
        className={cn(
          "w-100 shadow-lg relative",
          selected && "ring-2 ring-primary"
        )}
      >
        {/* Standard Target Handle (Top) */}
        <TargetHandles />
        {/* Custom Edit Target Handle (Left side) - Tahrirlanadigan messageni qabul qiladi */}
        {/* {messageIdSource === "connected_node" && <EditMessageSource />} */}
        <EditMessageSource />

        <NodeHeader
          icon={<Edit className="text-primary" />}
          title="Xabarni tahrirlash"
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
        {!isCollapsed && (
          <CardContent className="flex flex-col gap-4">
            {/* Message ID Source Selection */}
            <div className="grid gap-2">
              <Label>Message ID manbasi</Label>
              <Select
                value={messageIdSource}
                onValueChange={(value: MessageIdSource) =>
                  handleUpdate({ messageIdSource: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a fruit" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="connected_node">
                    Ulangan message node'dan
                  </SelectItem>
                  <SelectItem
                    value="this_message"
                    disabled={!isEnableEditThisMessage}
                  >
                    Ushbu xabar
                  </SelectItem>
                  <SelectItem value="message_id">Qo'lda kiritish</SelectItem>
                </SelectContent>
              </Select>

              {/* Manual message ID input */}
              {messageIdSource === "message_id" && (
                <div className="grid gap-2">
                  <Label>Message ID</Label>
                  <Input
                    placeholder="Message ID ni kiriting"
                    value={data.messageId || ""}
                    onChange={(e) =>
                      handleUpdate({ messageId: e.target.value })
                    }
                  />
                </div>
              )}

              {/* Connected message node status */}
              {messageIdSource === "connected_node" && (
                <div className="flex items-center gap-2 text-sm">
                  {hasConnectedNode ? (
                    <Badge variant="secondary" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {connectedMessageNode?.type || "Node"} ulangan
                    </Badge>
                  ) : (
                    <div className="flex items-center gap-1 text-destructive text-xs">
                      <AlertCircle className="h-3 w-3" />
                      Hech qanday message node ulanmagan
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Edit Type Specific UI */}
            {
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Yangi matn</Label>
                  <span
                    className={cn(
                      "text-xs",
                      (data.newText?.length || 0) > 4096
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {data.newText?.length || 0}/4096
                  </span>
                </div>
                <TextareaAutosize
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={
                    hasConnectedNode && connectedNodeData?.newText
                      ? `Joriy: ${connectedNodeData.messageText.substring(
                          0,
                          50
                        )}...`
                      : "Yangi matnni kiriting..."
                  }
                  value={data.newText || ""}
                  onChange={(e) => handleUpdate({ newText: e.target.value })}
                  maxLength={4096}
                />
              </div>
            }

            {
              <div className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label>Yangi caption</Label>
                  <span
                    className={cn(
                      "text-xs",
                      (data.newCaption?.length || 0) > 1024
                        ? "text-destructive"
                        : "text-muted-foreground"
                    )}
                  >
                    {data.newCaption?.length || 0}/1024
                  </span>
                </div>
                <TextareaAutosize
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder={
                    hasConnectedNode && connectedNodeData?.caption
                      ? `Joriy: ${connectedNodeData.caption.substring(
                          0,
                          50
                        )}...`
                      : "Yangi caption ni kiriting..."
                  }
                  value={data.newCaption || ""}
                  onChange={(e) => handleUpdate({ newCaption: e.target.value })}
                  maxLength={1024}
                />
              </div>
            }

            {/* Keyboard edit - har doim ko'rsatiladi agar message node ulangan bo'lsa */}
            {
              <div className="grid gap-2">
                <Label>Tugmalar</Label>
                <ButtonGenerator
                  initialKeyboard={data.keyboard || connectedNodeData?.keyboard}
                  onSave={(keyboard: KeyboardConfig) =>
                    handleUpdate({ keyboard })
                  }
                >
                  <div className="relative w-full">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground text-sm"
                    >
                      Tugmalarni sozlash
                    </button>
                    {(data.keyboard || connectedNodeData?.keyboard) &&
                      (((data.keyboard || connectedNodeData?.keyboard)
                        ?.active === "inline"
                        ? (data.keyboard || connectedNodeData?.keyboard)?.inline
                        : (data.keyboard || connectedNodeData?.keyboard)?.reply
                      )?.flat().length || 0) > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 px-1.5"
                        >
                          {((data.keyboard || connectedNodeData?.keyboard)
                            ?.active === "inline"
                            ? (data.keyboard || connectedNodeData?.keyboard)
                                ?.inline
                            : (data.keyboard || connectedNodeData?.keyboard)
                                ?.reply
                          )?.flat().length || 0}
                        </Badge>
                      )}
                  </div>
                </ButtonGenerator>
              </div>
            }

            {/* Keyboard edit maydonini alohida ko'rsatish - agar text yoki caption edit qilinayotgan bo'lsa */}
            {/* Barcha message node'lar uchun keyboard edit qilish mumkin */}
            {
              <div className="grid gap-2 border-t pt-4">
                <Label>Tugmalarni ham tahrirlash</Label>
                <ButtonGenerator
                  initialKeyboard={data.keyboard || connectedNodeData?.keyboard}
                  onSave={(keyboard: KeyboardConfig) =>
                    handleUpdate({ keyboard })
                  }
                >
                  <div className="relative w-full">
                    <button
                      type="button"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-input bg-background rounded-md hover:bg-accent hover:text-accent-foreground text-sm"
                    >
                      Tugmalarni sozlash
                    </button>
                    {(data.keyboard || connectedNodeData?.keyboard) &&
                      (((data.keyboard || connectedNodeData?.keyboard)
                        ?.active === "inline"
                        ? (data.keyboard || connectedNodeData?.keyboard)?.inline
                        : (data.keyboard || connectedNodeData?.keyboard)?.reply
                      )?.flat().length || 0) > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-2 -right-2 px-1.5"
                        >
                          {((data.keyboard || connectedNodeData?.keyboard)
                            ?.active === "inline"
                            ? (data.keyboard || connectedNodeData?.keyboard)
                                ?.inline
                            : (data.keyboard || connectedNodeData?.keyboard)
                                ?.reply
                          )?.flat().length || 0}
                        </Badge>
                      )}
                  </div>
                </ButtonGenerator>
              </div>
            }

            {
              <div className="grid gap-2">
                <Select
                  value={data.mediaType || "photo"}
                  onValueChange={(
                    value: "photo" | "video" | "audio" | "file"
                  ) => handleUpdate({ mediaType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Media turi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="photo">Rasm</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="file">Fayl</SelectItem>
                  </SelectContent>
                </Select>
                <div className="grid gap-2">
                  <Label>Media manbasi (URL yoki file_id)</Label>
                  <Input
                    placeholder="https://example.com/image.jpg yoki file_id"
                    value={data.mediaSource || ""}
                    onChange={(e) =>
                      handleUpdate({ mediaSource: e.target.value })
                    }
                  />
                </div>
              </div>
            }

            {/* Configuration Status */}
            {
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Barcha maydonlar to'ldirilishi kerak</span>
              </div>
            }
          </CardContent>
        )}
        {/* Standard Source Handle (Bottom) */}
        <SourceHandles />
      </Card>
    );
  }
);

EditMessageNode.displayName = "EditMessageNode";
