"use client";

/**
 * shared-message-fields.tsx
 *
 * Reusable field components for message-related nodes.
 * These are consumed by:
 *  - fieldWidgetRegistry.tsx  (via the "richTextMessage" / "mediaMessage" manifest field types)
 *  - widgetRegistry.tsx       (for the remaining bespoke widgets that embed these)
 *
 * No logic duplication between the two call-sites.
 */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DynamicMessageConstructor } from "@/features/bot-constructor/nodes/bespoke/TextMessageNode/components/dynamic-message-constructor-modal";
import TelegramRichTextEditor from "@/features/bot-constructor/panels/TelegramRichTextEditor/TelegramRichTextEditor";
import { useFlowStore } from "@/features/bot-constructor/store";
import { useVarSuggestions } from "@/features/bot-constructor/hooks/useVarSuggestions";
import useProjectStore from "@/features/bot-constructor/store/project";
import { uploadFile } from "@/services/requests/file";
import { cn } from "@/lib/utils";
import { CheckCircle2, ListPlus, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// RichTextMessageField
// ---------------------------------------------------------------------------

export interface RichTextMessageFieldProps {
  nodeId: string;
  /** data key for the message text value */
  textKey: string;
  /** data key for dynamic messages; omit to hide the dynamic-message button */
  dynamicKey?: string;
  data: Record<string, unknown>;
  label: string;
  /** Optional intro note rendered above the editor */
  intro?: string;
  /** Whether to show the parse-mode selector */
  showParseMode?: boolean;
}

export function RichTextMessageField({
  nodeId,
  textKey,
  dynamicKey,
  data,
  label,
  intro,
  showParseMode,
}: RichTextMessageFieldProps) {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const suggestions = useVarSuggestions(nodeId);
  const value = typeof data[textKey] === "string" ? (data[textKey] as string) : "";
  const parseMode = typeof data.parseMode === "string" ? data.parseMode : "None";
  const dynamicMessages = dynamicKey ? data[dynamicKey] : undefined;

  return (
    <div className="grid gap-3">
      {intro ? (
        <div className="rounded-md bg-muted/50 px-2 py-1.5 text-xs text-muted-foreground">
          {intro}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        {dynamicKey ? (
          <DynamicMessageConstructor
            handleUpdate={(update) => updateNodeData(nodeId, update)}
            initialDynamicMessages={dynamicMessages as never}
            id={nodeId}
          >
            <Button size="icon-sm" variant="outline">
              <ListPlus />
            </Button>
          </DynamicMessageConstructor>
        ) : null}
      </div>

      <TelegramRichTextEditor
        defaultValue={value}
        onChange={(nextValue) => updateNodeData(nodeId, { [textKey]: nextValue })}
        suggestions={suggestions}
      />

      {showParseMode ? (
        <div className="grid gap-2">
          <Label>Matn formatlash</Label>
          <Select
            value={parseMode}
            onValueChange={(nextValue) =>
              updateNodeData(nodeId, { parseMode: nextValue })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Tanlang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="None">Yo&apos;q</SelectItem>
              <SelectItem value="HTML">HTML</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MediaMessageField
// ---------------------------------------------------------------------------

export type MediaKind = "photo" | "video" | "audio" | "file";

const MEDIA_LABELS: Record<
  MediaKind,
  {
    title: string;
    fileIdPlaceholder: string;
    urlPlaceholder: string;
    accept: string;
    hint: string;
    captionLabel: string;
    sourceTypeKey: string;
    fileIdKey: string;
    urlKey: string;
  }
> = {
  photo: {
    title: "Rasm manbasi",
    fileIdPlaceholder: "rasm_fayl_idsi_bu_yerda...",
    urlPlaceholder: "https://example.com/image.jpg",
    accept: "image/*",
    hint: "Rasm fayllari (JPG, PNG, GIF, WebP)",
    captionLabel: "Rasm matni (Caption)",
    sourceTypeKey: "photoSourceType",
    fileIdKey: "photoFileId",
    urlKey: "photoUrl",
  },
  video: {
    title: "Video manbasi",
    fileIdPlaceholder: "video_fayl_idsi...",
    urlPlaceholder: "https://example.com/video.mp4",
    accept: "video/*",
    hint: "Video fayllari (MP4, MOV, AVI, WebM)",
    captionLabel: "Video matni (Caption)",
    sourceTypeKey: "videoSourceType",
    fileIdKey: "videoFileId",
    urlKey: "videoUrl",
  },
  audio: {
    title: "Audio manbasi",
    fileIdPlaceholder: "audio_fayl_idsi...",
    urlPlaceholder: "https://example.com/audio.mp3",
    accept: "audio/*",
    hint: "Audio fayllari (MP3, WAV, OGG, AAC)",
    captionLabel: "Izoh (Caption)",
    sourceTypeKey: "audioSourceType",
    fileIdKey: "audioFileId",
    urlKey: "audioUrl",
  },
  file: {
    title: "Fayl manbasi",
    fileIdPlaceholder: "fayl_idsi...",
    urlPlaceholder: "https://example.com/document.pdf",
    accept: "*/*",
    hint: "Har qanday fayl turi",
    captionLabel: "Izoh (Caption)",
    sourceTypeKey: "fileSourceType",
    fileIdKey: "fileId",
    urlKey: "fileUrl",
  },
};

export interface MediaMessageFieldProps {
  nodeId: string;
  data: Record<string, unknown>;
  kind: MediaKind;
}

export function MediaMessageField({ nodeId, data, kind }: MediaMessageFieldProps) {
  const project = useProjectStore((state) => state.project);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const suggestions = useVarSuggestions(nodeId);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const labels = MEDIA_LABELS[kind];
  const { sourceTypeKey, fileIdKey, urlKey } = labels;
  const sourceType =
    typeof data[sourceTypeKey] === "string" ? (data[sourceTypeKey] as string) : "upload";
  const captionValue =
    typeof data.caption === "string" ? (data.caption as string) : "";

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);
    try {
      const response = await uploadFile(file, undefined, project?.id);
      updateNodeData(nodeId, { uploadedFileUuid: response.data.uuid });
      setUploadedFileName(file.name);
    } catch {
      setUploadedFileName(null);
      toast.error("Fayl yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="grid gap-4">
      {/* Source selector */}
      <div className="grid gap-2">
        <Label>{labels.title}</Label>
        <Select
          value={sourceType}
          onValueChange={(value) =>
            updateNodeData(nodeId, { [sourceTypeKey]: value })
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

        {sourceType === "file_id" ? (
          <Input
            placeholder={labels.fileIdPlaceholder}
            value={typeof data[fileIdKey] === "string" ? (data[fileIdKey] as string) : ""}
            onChange={(e) => updateNodeData(nodeId, { [fileIdKey]: e.target.value })}
          />
        ) : null}

        {sourceType === "url" ? (
          <Input
            placeholder={labels.urlPlaceholder}
            value={typeof data[urlKey] === "string" ? (data[urlKey] as string) : ""}
            onChange={(e) => updateNodeData(nodeId, { [urlKey]: e.target.value })}
          />
        ) : null}

        {sourceType === "upload" ? (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={labels.accept}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (file) await handleFileUpload(file);
              }}
              className="hidden"
            />
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const file = e.dataTransfer.files?.[0];
                if (file) await handleFileUpload(file);
              }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-6 transition-colors",
                "hover:border-primary/50 hover:bg-primary/5",
                isUploading && "pointer-events-none opacity-50"
              )}
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
                      <p className="mt-1 text-xs text-muted-foreground">
                        {labels.hint}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {uploadedFileName && data.uploadedFileUuid && !isUploading ? (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="truncate">{uploadedFileName}</span>
              </div>
            ) : null}

            <div className="grid gap-1">
              <Label className="text-xs text-muted-foreground">UUID</Label>
              <Input
                placeholder="UUID ni kiriting yoki fayl yuklang..."
                value={
                  typeof data.uploadedFileUuid === "string"
                    ? (data.uploadedFileUuid as string)
                    : ""
                }
                onChange={(e) =>
                  updateNodeData(nodeId, { uploadedFileUuid: e.target.value })
                }
                className="text-xs"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Audio-specific: performer + title */}
      {kind === "audio" ? (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Ijrochi</Label>
            <Input
              placeholder="Masalan, Yulduz U."
              value={typeof data.performer === "string" ? (data.performer as string) : ""}
              onChange={(e) => updateNodeData(nodeId, { performer: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Sarlavha</Label>
            <Input
              placeholder="Masalan, Xasta bo'lma"
              value={typeof data.title === "string" ? (data.title as string) : ""}
              onChange={(e) => updateNodeData(nodeId, { title: e.target.value })}
            />
          </div>
        </div>
      ) : null}

      {/* Caption */}
      <div className="grid gap-2">
        <Label>{labels.captionLabel}</Label>
        {kind === "file" ? (
          <Textarea
            className="min-h-[90px]"
            maxLength={1024}
            placeholder="Fayl uchun izoh..."
            value={captionValue}
            onChange={(e) => updateNodeData(nodeId, { caption: e.target.value })}
          />
        ) : (
          <TelegramRichTextEditor
            defaultValue={captionValue}
            onChange={(caption) => updateNodeData(nodeId, { caption })}
            suggestions={suggestions}
          />
        )}
        <div
          className={cn(
            "text-right text-xs",
            captionValue.length > 1024 ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {captionValue.length}/1024
        </div>
      </div>
    </div>
  );
}
