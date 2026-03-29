"use client";

import { useState, memo, useRef } from "react";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";
import { NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendAudioNodeData, AudioSourceType } from "./types";
import { uploadFile } from "@/services/requests/file";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import useProjectStore from "@/features/bot-constructor/store/project";

import { FiMusic } from "react-icons/fi";

// Bizning andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { SourceHandles, TargetHandles } from "../../components";
import { SelectedMessageTarget } from "../../components/shared/ReactFlowHandles/SelectedMessageTarget";
import { ActionPanel } from "../../components/shared/ActionPanel";
import TextArea from "../shared/text-area";
import { HandlersList } from "../shared/HandlerBuilder/HandlersList";
import TelegramRichTextEditor from "@/features/bot-constructor/components/TelegramRichTextEditor/TelegramRichTextEditor";
import { NodeTextPreview } from "../../components/shared/NodeTextPreview";

const SendAudioNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendAudioNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const project = useProjectStore((state) => state.project);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (update: Partial<SendAudioNodeData>) => {
    updateNodeData(id, update);
  };

  const handleFileUpload = async (file: File) => {
    if (!file && !project) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      // File type avtomatik aniqlanadi
      const response = await uploadFile(file, undefined, project?.id);
      handleUpdate({ uploadedFileUuid: response.data.uuid });
      setUploadedFileName(file.name);
    } catch (error) {
      console.error("Fayl yuklashda xatolik:", error);
      setUploadedFileName(null);
      alert("Fayl yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko'ring.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFileUpload(file);
    }
  };

  const captionLength = data.caption?.length || 0;
  const buttonCount =
    (data.keyboard?.active === "inline"
      ? data.keyboard?.inline
      : data.keyboard?.reply
    )?.flat().length || 0;

  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <SelectedMessageTarget />

      <NodeHeader
        icon={<FiMusic className="text-primary" />}
        title="Audio yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />
      <NodeTextPreview text={data.caption} placeholder="Caption yozilmagan..." />
      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Audio manbasi */}
            <div className="grid gap-2">
              <Label>Audio manbasi</Label>
              <Select
                value={data.audioSourceType}
                onValueChange={(value: AudioSourceType) =>
                  handleUpdate({ audioSourceType: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {data.audioSourceType === "file_id" && (
                <Input
                  placeholder="audio_fayl_idsi..."
                  value={data.audioFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ audioFileId: e.target.value })
                  }
                />
              )}
              {data.audioSourceType === "url" && (
                <Input
                  placeholder="https://example.com/audio.mp3"
                  value={data.audioUrl || ""}
                  onChange={(e) => handleUpdate({ audioUrl: e.target.value })}
                />
              )}
              {data.audioSourceType === "upload" && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`audio-upload-${id}`}
                  />
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-6 transition-colors",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "cursor-pointer",
                      isUploading && "opacity-50 pointer-events-none"
                    )}
                    onClick={() =>
                      !isUploading && fileInputRef.current?.click()
                    }
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-center">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                          <p className="text-sm font-medium">Yuklanmoqda...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">
                              Fayl tanlash yoki bu yerga sudrab tashlang
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Audio fayllari (MP3, WAV, OGG, AAC)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {uploadedFileName &&
                    data.uploadedFileUuid &&
                    !isUploading && (
                      <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="truncate">{uploadedFileName}</span>
                      </div>
                    )}
                  <div className="grid gap-1">
                    <Label className="text-xs text-muted-foreground">
                      UUID
                    </Label>
                    <Input
                      placeholder="UUID ni kiriting yoki fayl yuklang..."
                      value={data.uploadedFileUuid || ""}
                      onChange={(e) =>
                        handleUpdate({ uploadedFileUuid: e.target.value })
                      }
                      className="text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Audio metadatalari */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Ijrochi</Label>
                <Input
                  placeholder="Masalan, Yulduz U."
                  value={data.performer || ""}
                  onChange={(e) => handleUpdate({ performer: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Sarlavha</Label>
                <Input
                  placeholder="Masalan, Xasta bo'lma"
                  value={data.title || ""}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>

              <TelegramRichTextEditor
                defaultValue={data.caption}
                onChange={(e) => handleUpdate({ caption: e })}
              />

              <div
                className={cn(
                  "text-right text-xs",
                  captionLength > 1024
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {captionLength}/1024
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <ActionPanel keyboard={data.keyboard} disableNotification={data.disableNotification} protectContent={data.protectContent} id={id} recipients={data.recipients ?? { sendToSender: true, additionalIds: [] }} />
          </CardFooter>
        </>
      )}

      {/* Handler list */}
      <HandlersList keyboard={data.keyboard} sourceNodeId={id} />

      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const SendAudioNode = memo(SendAudioNodeComponent);
