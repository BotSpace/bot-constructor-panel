import React, { FC, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import {
  FiVideo,
  FiChevronUp,
  FiChevronDown,
  FiHelpCircle,
} from "react-icons/fi";

// shadcn/ui komponentlari
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// TypeScript Tiplari
type RecipientType = "sender" | "custom_id";
type VideoSourceType = "file_id" | "url" | "upload";

interface SendVideoNodeData {
  recipientType: RecipientType;
  chatId: string;
  videoSourceType: VideoSourceType;
  videoFileId: string;
  videoUrl: string;
  duration: number | "";
  width: number | "";
  height: number | "";
  supportsStreaming: boolean;
  hasCustomThumbnail: boolean;
  thumbnailFileId: string;
  caption: string;
  disableNotification: boolean;
  protectContent: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: SendVideoNodeData;
}

export const SendVideoNode: FC<CustomNodeProps> = ({ id, data }) => {
  const [nodeData, setNodeData] = useState<SendVideoNodeData>(data);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDataChange = (field: keyof SendVideoNodeData, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
  };

  const captionLength = nodeData.caption?.length || 0;

  return (
    <Card className={cn("w-96 shadow-lg")}>
      <Handle type="target" position={Position.Top} />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiVideo className="text-primary" />
          Video Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-5">
            {/* Qabul qiluvchi bo'limi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={nodeData.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleDataChange("recipientType", value)
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {nodeData.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={nodeData.chatId}
                  onChange={(e) => handleDataChange("chatId", e.target.value)}
                />
              )}
            </div>

            {/* Video manbasi bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`video-source-${id}`}>Video manbasi</Label>
              <Select
                value={nodeData.videoSourceType}
                onValueChange={(value: VideoSourceType) =>
                  handleDataChange("videoSourceType", value)
                }
              >
                <SelectTrigger id={`video-source-${id}`}>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {nodeData.videoSourceType === "file_id" && (
                <Input
                  placeholder="video_fayl_idsi..."
                  value={nodeData.videoFileId}
                  onChange={(e) =>
                    handleDataChange("videoFileId", e.target.value)
                  }
                />
              )}
              {nodeData.videoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/video.mp4"
                  value={nodeData.videoUrl}
                  onChange={(e) => handleDataChange("videoUrl", e.target.value)}
                />
              )}
            </div>

            {/* Video parametrlari bo'limi */}
            <div className="grid gap-2">
              <Label>Video parametrlari (ixtiyoriy)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Davomiyligi (s)"
                  value={nodeData.duration}
                  onChange={(e) =>
                    handleDataChange(
                      "duration",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Eni (px)"
                  value={nodeData.width}
                  onChange={(e) =>
                    handleDataChange(
                      "width",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
                <Input
                  type="number"
                  placeholder="Bo'yi (px)"
                  value={nodeData.height}
                  onChange={(e) =>
                    handleDataChange(
                      "height",
                      e.target.value === "" ? "" : parseInt(e.target.value)
                    )
                  }
                />
              </div>
            </div>

            {/* Qo'shimcha sozlamalar (Switch'lar bilan) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`custom-thumb-${id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Maxsus muqova
                </Label>
                <Switch
                  id={`custom-thumb-${id}`}
                  checked={nodeData.hasCustomThumbnail}
                  onCheckedChange={(checked) =>
                    handleDataChange("hasCustomThumbnail", checked)
                  }
                />
              </div>
              {nodeData.hasCustomThumbnail && (
                <Input
                  placeholder="Muqova uchun File ID"
                  value={nodeData.thumbnailFileId}
                  onChange={(e) =>
                    handleDataChange("thumbnailFileId", e.target.value)
                  }
                  className="animate-in fade-in-50"
                />
              )}

              <div className="flex items-center justify-between">
                <Label
                  htmlFor={`streaming-${id}`}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  Strimingni qo'llab-quvvatlash
                  <TooltipProvider delayDuration={100}>
                    <Tooltip>
                      <TooltipTrigger>
                        <FiHelpCircle className="text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Videoni to'liq yuklamasdan ko'rish imkonini beradi.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Switch
                  id={`streaming-${id}`}
                  checked={nodeData.supportsStreaming}
                  onCheckedChange={(checked) =>
                    handleDataChange("supportsStreaming", checked)
                  }
                />
              </div>
            </div>

            {/* Caption bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`caption-${id}`}>Video matni (Caption)</Label>
              <TextareaAutosize
                id={`caption-${id}`}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                minRows={3}
                maxRows={10}
                placeholder="Video uchun matn kiriting..."
                value={nodeData.caption}
                onChange={(e) => handleDataChange("caption", e.target.value)}
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

          <CardFooter className="flex justify-around">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={nodeData.disableNotification}
                onCheckedChange={(checked) =>
                  handleDataChange("disableNotification", checked)
                }
              />
              <Label
                htmlFor={`disable-notification-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={nodeData.protectContent}
                onCheckedChange={(checked) =>
                  handleDataChange("protectContent", checked)
                }
              />
              <Label
                htmlFor={`protect-content-${id}`}
                className="text-sm font-normal cursor-pointer"
              >
                Himoyalangan
              </Label>
            </div>
          </CardFooter>
        </>
      )}

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
};
