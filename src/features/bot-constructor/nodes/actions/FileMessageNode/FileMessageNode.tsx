"use client";

import { useState, memo, useRef } from "react";
import { NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/features/bot-constructor/store";
import { SendFileNodeData, FileSourceType } from "./types";
import { uploadFile } from "@/services/requests/file";
import { Upload, Loader2, CheckCircle2 } from "lucide-react";
import useProjectStore from "@/features/bot-constructor/store/project";

import { NodeHeader } from "../shared/NodeHeader";
import { FileText } from "lucide-react";
import { RecipientsManager } from "../shared/RecipientSelector";
import { SourceHandles, TargetHandles } from "../../components";
import { SelectedMessageTarget } from "../../components/shared/ReactFlowHandles/SelectedMessageTarget";
import { ButtonGenerator } from "@/features/bot-constructor/components/ButtonGenerator/ButtonGenerator";

const SendFileNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendFileNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const project = useProjectStore((state) => state.project);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpdate = (update: Partial<SendFileNodeData>) => {
    updateNodeData(id, update);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

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
        icon={<FileText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={buttonCount}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {!isCollapsed && (
        <>
          <CardContent className="flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <RecipientsManager
              recipients={data.recipients}
              onUpdate={handleUpdate}
            />

            {/* Fayl manbasi */}
            <div className="grid gap-2">
              <Label>Fayl manbasi</Label>
              <Select
                value={data.fileSourceType}
                onValueChange={(value: FileSourceType) =>
                  handleUpdate({ fileSourceType: value })
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
              {data.fileSourceType === "file_id" && (
                <Input
                  placeholder="fayl_idsi..."
                  value={data.fileId || ""}
                  onChange={(e) => handleUpdate({ fileId: e.target.value })}
                />
              )}
              {data.fileSourceType === "url" && (
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={data.fileUrl || ""}
                  onChange={(e) => handleUpdate({ fileUrl: e.target.value })}
                />
              )}
              {data.fileSourceType === "upload" && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id={`file-upload-${id}`}
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
                              Har qanday fayl turi
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

            {/* Maxsus muqova */}
            <div className="flex items-center justify-between space-y-0 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={`custom-thumb-${id}`}>Maxsus muqova</Label>
                <p className="text-xs text-muted-foreground">
                  Fayl uchun rasmli muqova.
                </p>
              </div>
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

            {/* Caption */}
            <div className="grid gap-2">
              <Label>Izoh (Caption)</Label>
              <TextareaAutosize
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Fayl uchun izoh..."
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

          <CardFooter>
            <ButtonGenerator initialKeyboard={data.keyboard} node_id={id} />
          </CardFooter>
        </>
      )}

      <SourceHandles />
    </Card>
  );
};

export const SendFileNode = memo(SendFileNodeComponent);
