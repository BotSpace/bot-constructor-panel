import { useState, memo, useMemo } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Edit, AlertCircle } from "lucide-react";
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandler, TargetHandler } from "../../components";
import { EditMessageNodeData, EditMessageType, MessageIdSource } from "./types";
import { EditMessageHandler } from "../../components/shared/ReactFlowHandlers/EditMessageHandler";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import TextareaAutosize from "react-textarea-autosize";
import { ParseMode, KeyboardConfig } from "../TextMessageNode/types";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator";
import { Badge } from "@/components/ui/badge";

export const EditMessageNode = memo(
  ({ id, data, selected, isConnectable }: NodeProps<EditMessageNodeData>) => {
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
      // EditMessageHandler'dan chiqqan edge'ni topish (source === id && sourceHandle === "edit-message-handler")
      const editHandlerEdge = edges.find(
        (edge) =>
          edge.source === id && edge.sourceHandle === "edit-message-handler"
      );
      if (!editHandlerEdge) return null;

      // Shu edge'ning target node'i (EditMessageTarget'ga ulangan message node)
      const targetNode = nodes.find(
        (node) => node.id === editHandlerEdge.target
      );
      return targetNode;
    }, [nodes, edges, id]);

    // Connected message node type'iga qarab avtomatik edit type'ni aniqlash
    const autoEditType = useMemo<EditMessageType | null>(() => {
      if (!connectedMessageNode) return null;

      const nodeType = connectedMessageNode.type;

      // Text message node - faqat matnini edit qilish mumkin
      if (nodeType === "SendTextMessageNode") {
        return "text";
      }

      // Media message nodes (photo, video, audio, file) - faqat caption'ni edit qilish mumkin
      if (
        nodeType === "SendPhotoNode" ||
        nodeType === "SendVideoNode" ||
        nodeType === "SendAudioNode" ||
        nodeType === "SendFileNode"
      ) {
        return "caption";
      }

      return null;
    }, [connectedMessageNode]);

    // Message ID source tanlash
    const messageIdSource = data.messageIdSource || "previous_node";

    // Edit type: avtomatik aniqlangan bo'lsa uni ishlatamiz, aks holda data'dan olamiz
    const editType = autoEditType || data.editType || "text";

    // Connected message node mavjudligini tekshirish
    const hasConnectedNode = !!connectedMessageNode;

    // Connected message node'dan ma'lumotlarni olish (avtomatik to'ldirish uchun)
    const connectedNodeData = connectedMessageNode?.data as any;

    // Konfiguratsiya holatini tekshirish
    const isConfigured = useMemo(() => {
      if (messageIdSource === "manual" && !data.messageId) return false;
      if (messageIdSource === "previous_node" && !hasConnectedNode)
        return false;

      switch (editType) {
        case "text":
          return !!data.newText;
        case "caption":
          return !!data.newCaption;
        case "keyboard":
          return !!data.keyboard;
        case "media":
          return !!data.mediaType && !!data.mediaSource;
        default:
          return false;
      }
    }, [messageIdSource, data, editType, hasConnectedNode]);

    return (
      <Card
        className={cn(
          "w-100 shadow-lg relative",
          selected && "ring-2 ring-primary"
        )}
      >
        {/* Standard Target Handle (Top) */}
        <TargetHandler />

        {/* Custom Edit Target Handle (Left side) - Tahrirlanadigan messageni qabul qiladi */}
        <EditMessageHandler />

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
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous_node">
                    Oldingi node'dan (ulangan)
                  </SelectItem>
                  <SelectItem value="context">Context'dan</SelectItem>
                  <SelectItem value="manual">Qo'lda kiritish</SelectItem>
                </SelectContent>
              </Select>

              {/* Manual message ID input */}
              {messageIdSource === "manual" && (
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
              {messageIdSource === "previous_node" && (
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

            {/* Edit Type Selection - faqat connected message node ulangan bo'lsa */}
            {hasConnectedNode && autoEditType && (
              <div className="grid gap-2">
                <Label>Nimani tahrirlash</Label>
                <Select
                  value={editType}
                  onValueChange={(value: EditMessageType) =>
                    handleUpdate({ editType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {autoEditType === "text" && (
                      <>
                        <SelectItem value="text">Matn</SelectItem>
                        <SelectItem value="keyboard">Tugmalar</SelectItem>
                      </>
                    )}
                    {autoEditType === "caption" && (
                      <>
                        <SelectItem value="caption">Caption</SelectItem>
                        <SelectItem value="keyboard">Tugmalar</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  {connectedMessageNode?.type === "SendTextMessageNode" &&
                    "Matn xabari ulangan - faqat matnini edit qilish mumkin"}
                  {(connectedMessageNode?.type === "SendPhotoNode" ||
                    connectedMessageNode?.type === "SendVideoNode" ||
                    connectedMessageNode?.type === "SendAudioNode" ||
                    connectedMessageNode?.type === "SendFileNode") &&
                    "Media xabari ulangan - faqat caption'ni edit qilish mumkin"}
                </p>
              </div>
            )}

            {/* Manual rejimda yoki connected message node ulanmagan bo'lsa - barcha variantlarni ko'rsatish */}
            {(!hasConnectedNode || !autoEditType) && (
              <div className="grid gap-2">
                <Label>Nimani tahrirlash</Label>
                <Select
                  value={editType}
                  onValueChange={(value: EditMessageType) =>
                    handleUpdate({ editType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Matn</SelectItem>
                    <SelectItem value="caption">
                      Caption (media uchun)
                    </SelectItem>
                    <SelectItem value="keyboard">Tugmalar</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Edit Type Specific UI */}
            {editType === "text" && (
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
                <Select
                  value={
                    data.parseMode || connectedNodeData?.parseMode || "None"
                  }
                  onValueChange={(value: ParseMode) =>
                    handleUpdate({ parseMode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Parse Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">Oddiy matn</SelectItem>
                    <SelectItem value="HTML">HTML</SelectItem>
                    <SelectItem value="MarkdownV2">MarkdownV2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {editType === "caption" && (
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
            )}

            {/* Keyboard edit - har doim ko'rsatiladi agar message node ulangan bo'lsa */}
            {editType === "keyboard" && (
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
            )}

            {/* Keyboard edit maydonini alohida ko'rsatish - agar text yoki caption edit qilinayotgan bo'lsa */}
            {/* Barcha message node'lar uchun keyboard edit qilish mumkin */}
            {hasConnectedNode &&
              (editType === "text" || editType === "caption") && (
                <div className="grid gap-2 border-t pt-4">
                  <Label>Tugmalarni ham tahrirlash</Label>
                  <ButtonGenerator
                    initialKeyboard={
                      data.keyboard || connectedNodeData?.keyboard
                    }
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
                          ? (data.keyboard || connectedNodeData?.keyboard)
                              ?.inline
                          : (data.keyboard || connectedNodeData?.keyboard)
                              ?.reply
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
              )}

            {editType === "media" && (
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
            )}

            {/* Configuration Status */}
            {!isConfigured && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>Barcha maydonlar to'ldirilishi kerak</span>
              </div>
            )}
          </CardContent>
        )}

        {/* Standard Source Handle (Bottom) */}
        <SourceHandler />
      </Card>
    );
  }
);

EditMessageNode.displayName = "EditMessageNode";
