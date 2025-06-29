import React, { FC, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize";
import {
  FiFileText,
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
type FileSourceType = "file_id" | "url" | "upload";

interface SendFileNodeData {
  recipientType: RecipientType;
  chatId: string;
  fileSourceType: FileSourceType;
  fileId: string;
  fileUrl: string;
  hasCustomThumbnail: boolean;
  thumbnailFileId: string;
  caption: string;
  disableContentTypeDetection: boolean;
  disableNotification: boolean;
  protectContent: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: SendFileNodeData;
}

export const SendFileNode: FC<CustomNodeProps> = ({ id, data }) => {
  const [nodeData, setNodeData] = useState<SendFileNodeData>(data);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleDataChange = (field: keyof SendFileNodeData, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
  };

  const captionLength = nodeData.caption?.length || 0;

  return (
    <Card className={cn("w-80 shadow-lg")}>
      {/* ===== YENGI QOIDA: CHIQISH (SOURCE) TEPADA ===== */}
      <Handle type="source" position={Position.Top} />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiFileText className="text-primary" />
          Fayl Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
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

            {/* Fayl manbasi bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`file-source-${id}`}>Fayl manbasi</Label>
              <Select
                value={nodeData.fileSourceType}
                onValueChange={(value: FileSourceType) =>
                  handleDataChange("fileSourceType", value)
                }
              >
                <SelectTrigger id={`file-source-${id}`}>
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {nodeData.fileSourceType === "file_id" && (
                <Input
                  placeholder="fayl_idsi..."
                  value={nodeData.fileId}
                  onChange={(e) => handleDataChange("fileId", e.target.value)}
                />
              )}
              {nodeData.fileSourceType === "url" && (
                <Input
                  placeholder="https://example.com/document.pdf"
                  value={nodeData.fileUrl}
                  onChange={(e) => handleDataChange("fileUrl", e.target.value)}
                />
              )}
            </div>

            {/* Maxsus muqova bo'limi */}
            <div className="flex items-center justify-between space-y-0 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor={`custom-thumb-${id}`}>Maxsus muqova</Label>
                <p className="text-xs text-muted-foreground">
                  Fayl uchun rasmli muqova.
                </p>
              </div>
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

            {/* Izoh (Caption) bo'limi */}
            <div className="grid gap-2">
              <Label htmlFor={`caption-${id}`}>Izoh (Caption)</Label>
              <TextareaAutosize
                id={`caption-${id}`}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                minRows={2}
                maxRows={8}
                placeholder="Fayl uchun izoh..."
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

          <CardFooter className="flex flex-wrap justify-around gap-y-4">
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
            <div className="flex items-center space-x-2">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`disable-mime-${id}`}
                        checked={nodeData.disableContentTypeDetection}
                        onCheckedChange={(checked) =>
                          handleDataChange(
                            "disableContentTypeDetection",
                            checked
                          )
                        }
                      />
                      <Label
                        htmlFor={`disable-mime-${id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        MIME-turini o'chirish
                      </Label>
                      <FiHelpCircle className="text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Telegram fayl turini (rasm/video) aniqlashga urinmaydi.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardFooter>
        </>
      )}

      {/* ===== YENGI QOIDA: KIRISH (TARGET) PASTDA ===== */}
      <Handle type="target" position={Position.Bottom} />
    </Card>
  );
};
