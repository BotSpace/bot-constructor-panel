"use client";

import { useState, memo, useRef } from "react";
import { NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { FiHelpCircle } from "react-icons/fi";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendVideoNodeData, RecipientType, VideoSourceType } from "./types";
import { uploadFile } from "@/services/requests/file";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import { Video } from "lucide-react";

// Andozamiz uchun yangi importlar
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandles, TargetHandles } from "../../components";
import { SelectedMessageTarget } from "../../components/shared/ReactFlowHandles/SelectedMessageTarget";

const SendVideoNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendVideoNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (update: Partial<SendVideoNodeData>) => {
    updateNodeData(id, update);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      // File type avtomatik aniqlanadi
      const response = await uploadFile(file);
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
    <Card className={cn("w-96 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />
      <SelectedMessageTarget />

      <NodeHeader
        icon={<Video className="text-primary" />}
        title="video Yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-5">
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Video manbasi */}
            <div className="grid gap-2">
              <Label>Video manbasi</Label>
              <Select
                value={data.videoSourceType}
                onValueChange={(value: VideoSourceType) =>
                  handleUpdate({ videoSourceType: value })
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
              {data.videoSourceType === "file_id" && (
                <Input
                  placeholder="video_fayl_idsi..."
                  value={data.videoFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ videoFileId: e.target.value })
                  }
                />
              )}
              {data.videoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={data.videoUrl || ""}
                  onChange={(e) => handleUpdate({ videoUrl: e.target.value })}
                />
              )}
              {data.videoSourceType === "upload" && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`video-upload-${id}`}
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
                              Video fayllari (MP4, MOV, AVI, WebM)
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
                  {data.uploadedFileUuid && !isUploading && (
                    <div className="text-xs text-muted-foreground">
                      UUID: {data.uploadedFileUuid}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Video parametrlari */}
            <div className="grid gap-2">
              <Label>Video parametrlari (ixtiyoriy)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="text"
                  placeholder="Davomiyligi (s)"
                  value={data.duration || ""}
                  onChange={(e) => handleUpdate({ duration: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Eni (px)"
                  value={data.width || ""}
                  onChange={(e) => handleUpdate({ width: e.target.value })}
                />
                <Input
                  type="text"
                  placeholder="Bo'yi (px)"
                  value={data.height || ""}
                  onChange={(e) => handleUpdate({ height: e.target.value })}
                />
              </div>
            </div>

            {/* Qo'shimcha sozlamalar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`custom-thumb-${id}`}
                  className="cursor-pointer"
                >
                  Maxsus muqova
                </Label>
                <Switch
                  id={`custom-thumb-${id}`}
                  checked={!!data.hasCustomThumbnail}
                  onCheckedChange={(checked) =>
                    handleUpdate({ hasCustomThumbnail: checked })
                  }
                />
              </div>
              {data.hasCustomThumbnail && (
                <Input
                  placeholder="Muqova uchun File ID"
                  value={data.thumbnailFileId || ""}
                  onChange={(e) =>
                    handleUpdate({ thumbnailFileId: e.target.value })
                  }
                  className="animate-in fade-in-50"
                />
              )}
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`streaming-${id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Striming
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <FiHelpCircle className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Videoni to'liq yuklamasdan ko'rish.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Switch
                  id={`streaming-${id}`}
                  checked={!!data.supportsStreaming}
                  onCheckedChange={(checked) =>
                    handleUpdate({ supportsStreaming: checked })
                  }
                />
              </div>
            </div>

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Video matni (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Video uchun matn kiriting..."
                value={data.caption || ""}
                onChange={(e) => handleUpdate({ caption: e.target.value })}
                maxLength={1024}
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

          <NodeFooter
            nodeId={id}
            keyboard={data.keyboard}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
        </>
      )}

      <SourceHandles />
    </Card>
  );
};

export const SendVideoNode = memo(SendVideoNodeComponent);
