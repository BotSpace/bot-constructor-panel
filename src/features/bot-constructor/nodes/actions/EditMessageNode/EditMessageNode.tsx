"use client";

import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { memo, useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { SourceHandler, TargetHandler } from "../../components";
import { EditMessageNodeData, EditMessageType, MessageIdSource } from "./types";
import { ParseMode } from "../TextMessageNode/types";

const EditMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<EditMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const nodes = useNodes();
  const edges = useEdges();

  // Oldingi bog'langan node'larni topish
  const previousNode = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return null;

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    return parentNode || null;
  }, [nodes, edges, id]);

  // Oldingi node'ning turiga qarab qaysi edit qismlari mumkinligini aniqlash
  const availableEdits = useMemo<{
    text?: boolean;
    caption?: boolean;
    keyboard?: boolean;
    media?: boolean;
  }>(() => {
    if (!previousNode) {
      // Oldingi node bo'lmasa, barcha qismlar mumkin
      return { text: true, caption: true, keyboard: true, media: true };
    }

    const nodeType = previousNode.type;

    switch (nodeType) {
      case "SendTextMessageNode":
        // Text message'da faqat text va keyboard edit mumkin
        return { text: true, keyboard: true };
      case "SendPhotoNode":
      case "SendVideoNode":
      case "SendAudioNode":
      case "SendFileNode":
        // Media node'lar uchun caption, keyboard va media edit mumkin
        return { caption: true, keyboard: true, media: true };
      default:
        // Boshqa node'lar uchun barcha qismlar mumkin
        return { text: true, caption: true, keyboard: true, media: true };
    }
  }, [previousNode]);

  // Oldingi node'dan media type'ni aniqlash (media edit uchun)
  const autoDetectedMediaType = useMemo<
    "photo" | "video" | "audio" | "file" | null
  >(() => {
    if (!previousNode) return null;

    const nodeType = previousNode.type;

    switch (nodeType) {
      case "SendPhotoNode":
        return "photo";
      case "SendVideoNode":
        return "video";
      case "SendAudioNode":
        return "audio";
      case "SendFileNode":
        return "file";
      default:
        return null;
    }
  }, [previousNode]);

  // Oldingi node'dan ma'lumotlarni olish
  const previousNodeData = useMemo<any>(() => {
    if (!previousNode) return null;
    return previousNode.data;
  }, [previousNode]);

  const handleUpdate = (update: Partial<EditMessageNodeData>) => {
    updateNodeData(id, update);
  };

  // Oldingi node'dan ma'lumotlarni avtomatik olish
  useEffect(() => {
    if (
      previousNodeData &&
      !data.newText &&
      !data.newCaption &&
      !data.keyboard &&
      !data.mediaSource
    ) {
      const updates: Partial<EditMessageNodeData> = {};

      // Text edit uchun
      if (availableEdits.text && previousNodeData.messageText) {
        updates.newText = previousNodeData.messageText;
        updates.parseMode = previousNodeData.parseMode || "None";
      }

      // Caption edit uchun
      if (availableEdits.caption && previousNodeData.caption) {
        updates.newCaption = previousNodeData.caption;
      }

      // Keyboard edit uchun
      if (availableEdits.keyboard && previousNodeData.keyboard) {
        updates.keyboard = previousNodeData.keyboard;
      }

      // Media edit uchun
      if (availableEdits.media && autoDetectedMediaType) {
        updates.mediaType = autoDetectedMediaType;
        // Oldingi node'dan media source'ni olish
        if (previousNodeData.photoUrl)
          updates.mediaSource = previousNodeData.photoUrl;
        else if (previousNodeData.photoFileId)
          updates.mediaSource = previousNodeData.photoFileId;
        else if (previousNodeData.videoUrl)
          updates.mediaSource = previousNodeData.videoUrl;
        else if (previousNodeData.videoFileId)
          updates.mediaSource = previousNodeData.videoFileId;
        else if (previousNodeData.audioUrl)
          updates.mediaSource = previousNodeData.audioUrl;
        else if (previousNodeData.audioFileId)
          updates.mediaSource = previousNodeData.audioFileId;
        else if (previousNodeData.fileUrl)
          updates.mediaSource = previousNodeData.fileUrl;
        else if (previousNodeData.fileId)
          updates.mediaSource = previousNodeData.fileId;
      }

      if (Object.keys(updates).length > 0) {
        updateNodeData(id, updates);
      }
    }
  }, [
    previousNodeData,
    availableEdits,
    autoDetectedMediaType,
    data.newText,
    data.newCaption,
    data.keyboard,
    data.mediaSource,
    id,
    updateNodeData,
  ]);

  // UI'da ko'rsatish uchun hisob-kitoblar
  const textLength = data.newText?.length || 0;
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandler />

      <NodeHeader
        icon={<Edit className="text-primary" />}
        title="Xabarni tahrirlash"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Message ID manbasi */}
            <div className="grid gap-2">
              <Label>Message ID manbasi</Label>
              <Select
                value={data.messageIdSource || "context"}
                onValueChange={(value: MessageIdSource) =>
                  handleUpdate({ messageIdSource: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Message ID manbasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="context">Context'dan</SelectItem>
                  <SelectItem value="previous_node">
                    Oldingi node'dan
                  </SelectItem>
                  <SelectItem value="manual">Qo'lda kiritish</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Manual bo'lsa Message ID input */}
            {data.messageIdSource === "manual" && (
              <div className="grid gap-2">
                <Label>Message ID</Label>
                <Input
                  placeholder="Message ID ni kiriting..."
                  value={data.messageId || ""}
                  onChange={(e) => handleUpdate({ messageId: e.target.value })}
                />
              </div>
            )}

            {/* Oldingi node ma'lumotlari */}
            {previousNode && (
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-2">
                  Oldingi node:{" "}
                  <span className="font-semibold">{previousNode.type}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  O'zgarishi mumkin bo'lgan qismlar:{" "}
                  {Object.entries(availableEdits)
                    .filter(([_, enabled]) => enabled)
                    .map(([key]) => {
                      const labels: Record<string, string> = {
                        text: "Matn",
                        caption: "Caption",
                        keyboard: "Tugmalar",
                        media: "Media",
                      };
                      return labels[key];
                    })
                    .join(", ")}
                </p>
              </div>
            )}

            {/* Text edit */}
            {availableEdits.text && (
              <>
                <div className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <Label>Yangi matn</Label>
                    <span
                      className={cn(
                        "text-xs",
                        textLength > 4096
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    >
                      {textLength}/4096
                    </span>
                  </div>
                  <TextareaAutosize
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder={
                      previousNodeData?.messageText
                        ? `Joriy matn: ${previousNodeData.messageText.substring(
                            0,
                            50
                          )}...`
                        : "Yangi matnni kiriting..."
                    }
                    value={data.newText || ""}
                    onChange={(e) => handleUpdate({ newText: e.target.value })}
                    maxLength={4096}
                  />
                  {previousNodeData?.messageText && !data.newText && (
                    <p className="text-xs text-muted-foreground">
                      Joriy matn: {previousNodeData.messageText}
                    </p>
                  )}
                </div>
                <div className="grid gap-3">
                  <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4" /> Sozlamalar
                  </Label>
                  <Select
                    value={data.parseMode || "None"}
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
              </>
            )}

            {/* Caption edit */}
            {availableEdits.caption && (
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
                    previousNodeData?.caption
                      ? `Joriy caption: ${previousNodeData.caption.substring(
                          0,
                          50
                        )}...`
                      : "Yangi caption kiriting..."
                  }
                  value={data.newCaption || ""}
                  onChange={(e) => handleUpdate({ newCaption: e.target.value })}
                  maxLength={1024}
                />
                {previousNodeData?.caption && !data.newCaption && (
                  <p className="text-xs text-muted-foreground">
                    Joriy caption: {previousNodeData.caption}
                  </p>
                )}
              </div>
            )}

            {/* Media edit */}
            {availableEdits.media && (
              <>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Media turi</Label>
                    {autoDetectedMediaType && previousNode && (
                      <span className="text-xs text-muted-foreground">
                        Avtomatik: {autoDetectedMediaType}
                      </span>
                    )}
                  </div>
                  <Select
                    value={data.mediaType || autoDetectedMediaType || "photo"}
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
                </div>
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
              </>
            )}
          </CardContent>

          {/* Keyboard edit uchun footer */}
          {availableEdits.keyboard && (
            <NodeFooter
              nodeId={id}
              keyboard={data.keyboard}
              onUpdate={(update) => handleUpdate(update)}
            />
          )}
        </>
      )}
      <SourceHandler />
    </Card>
  );
};

export const EditMessageNode = memo(EditMessageNodeComponent);
