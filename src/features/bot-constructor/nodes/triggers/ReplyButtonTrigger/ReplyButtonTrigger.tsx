"use client";

import { memo, useMemo } from "react";
import { NodeProps, useNodes, useEdges } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReplyButtonTriggerData } from "./types";
import { AlertCircle, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { KeyboardConfig } from "../../actions/TextMessageNode/types";
import { Checkbox } from "@/components/ui/checkbox";

// YORDAMCHI INTERFEYS: Ota-ona node'ning `data` obyekti qanday bo'lishini tasvirlaydi
// --- O'ZGARTIRISH: `keyboard` ixtiyoriy qilindi, xatolikdan saqlanish uchun ---
interface NodeWithButtonsData {
  keyboard?: KeyboardConfig;
}

const ReplyButtonTriggerNodeComponent = ({
  id,
  data,
  selected,
}: NodeProps<ReplyButtonTriggerData>) => {
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const nodes = useNodes();
  const edges = useEdges();

  // --- O'ZGARTIRISH: Mantiq to'liq yangilandi va soddalashtirildi ---
  const availableReplyButtons = useMemo(() => {
    const incomingEdge = edges.find((edge) => edge.target === id);
    if (!incomingEdge) return [];

    const parentNode = nodes.find((node) => node.id === incomingEdge.source);
    if (!parentNode) return [];

    const parentNodeData = parentNode.data as NodeWithButtonsData;
    // Ota-ona node'da `keyboard` yoki `keyboard.reply` bo'lmasa, bo'sh massiv qaytaramiz
    if (!parentNodeData.keyboard || !parentNodeData.keyboard.reply) {
      return [];
    }

    // 1. Ota-onaning `reply` tugmalarini olamiz (bu 2D massiv)
    const replyButtonRows = parentNodeData.keyboard.reply;

    // 2. Massivni bir o'lchamli qilamiz (`.flat()`)
    // 3. Faqat "Reply Keyboard" uchun mo'ljallangan tugmalarni filterlaymiz
    const allReplyButtons = replyButtonRows
      .flat()
      .filter(
        (button) =>
          button.type === "reply" ||
          button.type === "request_contact" ||
          button.type === "request_location"
      );

    return allReplyButtons;
  }, [nodes, edges, id]);

  const handleSelectionChange = (selectedButtonId: string) => {
    // Tanlangan ID bo'yicha to'liq tugma obyektini topamiz
    const selectedButtonObject = availableReplyButtons.find(
      (btn) => btn.id === selectedButtonId
    );

    // Va shu obyektni state'ga yozamiz
    updateNodeData(id, { selectedButton: selectedButtonObject });
  };

  const isConfigured = !!data.selectedButton;

  return (
    <Card className={cn("w-80 shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <CornerDownLeft className="h-5 w-5 text-primary" />
            <span>Reply Tugma Handleri</span>
          </div>
          <div
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              isConfigured ? "bg-green-500" : "bg-destructive/50"
            }`}
            title={isConfigured ? "Sozlangan" : "Sozlanmagan"}
          />
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {availableReplyButtons.length > 0 ? (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">
              Qaysi tugma ushlansin?
            </Label>

            <RadioGroup
              value={data.selectedButton?.id} // Tanlangan tugmaning ID'sini `value` sifatida beramiz
              onValueChange={handleSelectionChange} // O'zgarish bo'lganda handler'ni chaqiramiz
            >
              {availableReplyButtons.map((button) => (
                <div className="flex items-center gap-3" key={button.id}>
                  <RadioGroupItem
                    className="cursor-pointer"
                    value={button.id}
                    id={`r-${button.id}`}
                  />
                  <Label
                    htmlFor={`r-${button.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {button.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        ) : (
          <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>
              Iltimos, bu nodeni Reply-tugmalari mavjud bo'lgan node'ga ulang.
            </span>
          </div>
        )}

        <Label className="mt-2">
          <Checkbox
            checked={data.global}
            onCheckedChange={(e) =>
              updateNodeData(id, {
                global: e as boolean,
              })
            }
          />
          Global
        </Label>
      </CardContent>
      <SourceHandles />
    </Card>
  );
};

export const ReplyButtonTriggerNode = memo(ReplyButtonTriggerNodeComponent);
