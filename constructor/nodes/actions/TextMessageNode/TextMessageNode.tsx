import { Handle, NodeProps, Position } from "reactflow";

import TextareaAutosize from "react-textarea-autosize";

import { ParseMode, RecipientType, SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/constructor/store/flowStore";
import { memo, useState } from "react";
import { ButtonConfig } from "@/constructor/components/ButtonGenerator/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChevronDown, LayoutGrid, MessageSquare, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Label } from "@radix-ui/react-dropdown-menu";
import { ToggleGroup } from "@/components/ui/toggle-group";
import { ToggleGroupItem } from "@radix-ui/react-toggle-group";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Checkbox } from "@radix-ui/react-checkbox";
import { ButtonGenerator } from "@/constructor/components/ButtonGenerator";
import { Button } from "@/components/ui/button";

const SendTextMessageNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<SendTextMessageNodeData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Ma'lumotlarni global store'da yangilash uchun markaziy funksiya
  const handleUpdate = (update: Partial<SendTextMessageNodeData>) => {
    updateNodeData(id, update);
  };
  // ButtonGenerator'dan qaytgan natijani saqlash uchun maxsus funksiya
  const handleSaveButtons = (buttons: ButtonConfig[][]) => {
    updateNodeData(id, { buttons });
  };
  // UI'da ko'rsatish uchun hisob-kitoblar
  const textLength = data.messageText?.length || 0;
  const isNodeConfigured = !!(data.recipientType && data.messageText);
  const buttonCount = data.buttons?.flat().length || 0; // Barcha tugmalar soni
  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />
      Generated code
      <CardHeader
        className="flex flex-row items-center justify-between space-y-0 p-3 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <MessageSquare className="text-primary" />
          Matnli Xabar
        </CardTitle>
        <div className="flex items-center gap-2">
          {buttonCount > 0 && (
            <Badge variant="secondary" className="font-normal">
              <LayoutGrid className="w-3 h-3 mr-1" />
              {buttonCount}
            </Badge>
          )}
          <div
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              isNodeConfigured ? "bg-green-500" : "bg-yellow-500"
            )}
            title={isNodeConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
          <div className="text-muted-foreground">
            {isCollapsed ? (
              <ChevronDown />
            ) : (
              <ChevronDown className="rotate-180" />
            )}
          </div>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <>
          <CardContent className="p-4 pt-0 flex flex-col gap-4">
            {/* Qabul qiluvchi */}
            <div className="grid gap-2">
              <Label>Qabul qiluvchi</Label>
              <ToggleGroup
                type="single"
                value={data.recipientType}
                onValueChange={(value: RecipientType) =>
                  value && handleUpdate({ recipientType: value })
                }
                className="w-full grid grid-cols-2"
              >
                <ToggleGroupItem value="sender">Yuboruvchiga</ToggleGroupItem>
                <ToggleGroupItem value="custom_id">ID bo'yicha</ToggleGroupItem>
              </ToggleGroup>
              {data.recipientType === "custom_id" && (
                <Input
                  placeholder="Chat yoki foydalanuvchi ID"
                  value={data.chatId || ""}
                  onChange={(e) => handleUpdate({ chatId: e.target.value })}
                />
              )}
            </div>

            {/* Xabar matni */}
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Xabar matni</Label>
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
                placeholder="Bu yerga xabar matnini yozing..."
                value={data.messageText || ""}
                onChange={(e) => handleUpdate({ messageText: e.target.value })}
                maxLength={4096}
              />
            </div>

            {/* Sozlamalar */}
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
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`disable-preview-${id}`}
                  checked={!!data.disableWebPagePreview}
                  onCheckedChange={(checked) =>
                    handleUpdate({ disableWebPagePreview: !!checked })
                  }
                />
                <Label className="text-sm font-normal cursor-pointer">
                  Link uchun prevyuni o'chirish
                </Label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-wrap justify-around gap-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`disable-notification-${id}`}
                checked={!!data.disableNotification}
                onCheckedChange={(checked) =>
                  handleUpdate({ disableNotification: !!checked })
                }
              />
              <Label className="text-sm font-normal cursor-pointer">
                Ovozsiz
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`protect-content-${id}`}
                checked={!!data.protectContent}
                onCheckedChange={(checked) =>
                  handleUpdate({ protectContent: !!checked })
                }
              />
              <Label className="text-sm font-normal cursor-pointer">
                Himoyalangan
              </Label>
            </div>

            {/* BUTTON GENERATOR INTEGRATSIYASI */}
            <ButtonGenerator
              initialButtons={data.buttons}
              onSave={handleSaveButtons}
            >
              <div className="relative w-full">
                <Button variant="outline" className="w-full">
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Buttons
                </Button>
                {buttonCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
                  >
                    {buttonCount}
                  </Badge>
                )}
              </div>
            </ButtonGenerator>
          </CardFooter>
        </>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-teal-500"
      />
    </Card>
  );
};

export const SendTextMessageNode = memo(SendTextMessageNodeComponent);
