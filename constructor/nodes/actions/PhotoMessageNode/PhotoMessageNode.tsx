import React, { FC, useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import TextareaAutosize from "react-textarea-autosize"; // Avtomatik kengayish uchun
import { FiCamera, FiChevronUp, FiChevronDown } from "react-icons/fi";

// shadcn/ui komponentlarini import qilish
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
import { cn } from "@/lib/utils"; // shadcn/ui'dan keladigan cn utilitasi

// Misol uchun tiplar
type RecipientType = "sender" | "custom_id";
type PhotoSourceType = "file_id" | "url" | "upload";
interface SendPhotoNodeData {
  recipientType: RecipientType;
  chatId: string;
  photoSourceType: PhotoSourceType;
  photoFileId: string;
  photoUrl: string;
  caption: string;
  disableNotification: boolean;
  protectContent: boolean;
}

interface CustomNodeProps extends NodeProps {
  data: SendPhotoNodeData;
  // Asosiy state uchun:
  // onDataChange: (id: string, newData: Partial<SendPhotoNodeData>) => void;
}

export const SendPhotoNode: FC<CustomNodeProps> = ({
  id,
  data,
  isSelected = false,
}) => {
  const [nodeData, setNodeData] = useState<SendPhotoNodeData>(data);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Barcha o'zgarishlarni boshqaruvchi yagona funksiya
  const handleDataChange = (field: keyof SendPhotoNodeData, value: any) => {
    setNodeData((prev) => ({ ...prev, [field]: value }));
    // onDataChange?.(id, { [field]: value });
  };

  const captionLength = nodeData.caption?.length || 0;

  return (
    <Card
      className={cn(
        "w-80 shadow-lg",
        isSelected && "ring-2 ring-ring ring-offset-2 ring-offset-background"
      )}
    >
      <Handle type="target" position={Position.Top} />

      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <FiCamera className="text-primary" />
          Rasm Yuborish
        </CardTitle>
        <div className="text-muted-foreground">
          {isCollapsed ? <FiChevronDown /> : <FiChevronUp />}
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label htmlFor="recipient-type">Qabul qiluvchi</Label>
              <ToggleGroup
                id="recipient-type"
                type="single"
                value={nodeData.recipientType}
                onValueChange={(value: RecipientType) => {
                  if (value) handleDataChange("recipientType", value);
                }}
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

            {/* Rasm manbasi */}
            <div className="grid gap-2">
              <Label htmlFor="photo-source">Rasm manbasi</Label>
              <Select
                value={nodeData.photoSourceType}
                onValueChange={(value: PhotoSourceType) =>
                  handleDataChange("photoSourceType", value)
                }
              >
                <SelectTrigger id="photo-source">
                  <SelectValue placeholder="Manbani tanlang..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="file_id">Mavjud File ID</SelectItem>
                  <SelectItem value="url">Internet (URL)</SelectItem>
                  <SelectItem value="upload">Kompyuterdan yuklash</SelectItem>
                </SelectContent>
              </Select>
              {/* Kerakli inputni ko'rsatish */}
              {nodeData.photoSourceType === "file_id" && (
                <Input
                  placeholder="rasm_fayl_idsi_bu_yerda..."
                  value={nodeData.photoFileId}
                  onChange={(e) =>
                    handleDataChange("photoFileId", e.target.value)
                  }
                />
              )}
              {nodeData.photoSourceType === "url" && (
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={nodeData.photoUrl}
                  onChange={(e) => handleDataChange("photoUrl", e.target.value)}
                />
              )}
            </div>

            {/* Rasm matni (Caption) */}
            <div className="grid gap-2">
              <Label htmlFor="caption">Rasm matni (Caption)</Label>
              {/* TextareaAutosize ga shadcn/ui ning Textarea stillarini beramiz */}
              <TextareaAutosize
                id="caption"
                className={cn(
                  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                  "resize-none" // Bu muhim!
                )}
                minRows={3}
                maxRows={10}
                placeholder="Rasm uchun matn kiriting..."
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
                id="disable-notification"
                checked={nodeData.disableNotification}
                onCheckedChange={(checked) =>
                  handleDataChange("disableNotification", checked)
                }
              />
              <Label
                htmlFor="disable-notification"
                className="text-sm font-normal cursor-pointer"
              >
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="protect-content"
                checked={nodeData.protectContent}
                onCheckedChange={(checked) =>
                  handleDataChange("protectContent", checked)
                }
              />
              <Label
                htmlFor="protect-content"
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

export default SendPhotoNode;
