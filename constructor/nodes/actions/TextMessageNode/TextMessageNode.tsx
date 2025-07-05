import { Handle, NodeProps, Position } from "reactflow";

import TextareaAutosize from "react-textarea-autosize";

import { ParseMode, SendTextMessageNodeData } from "./types";
import { useFlowStore } from "@/constructor/store/flowStore";
import { memo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LetterText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Select } from "@/components/ui/select";
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Checkbox } from "@radix-ui/react-checkbox";
import { NodeHeader } from "../shared/NodeHeader";
import { NodeFooter } from "../shared/NodeFooter";
import { RecipientsManager } from "../shared/RecipientSelector";

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

  // UI'da ko'rsatish uchun hisob-kitoblar
  const textLength = data.messageText?.length || 0;
  return (
    <Card className={cn("w-100 shadow-lg", selected && "ring-2 ring-primary")}>
      <Handle type="target" position={Position.Top} className="!bg-sky-500" />

      <NodeHeader
        icon={<LetterText className="text-primary" />}
        title="Xabar yuborish"
        buttonCount={data.buttons?.flat().length || 0}
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

          <NodeFooter
            nodeId={id}
            buttons={data.buttons}
            disableNotification={data.disableNotification}
            protectContent={data.protectContent}
            onUpdate={handleUpdate}
          />
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
