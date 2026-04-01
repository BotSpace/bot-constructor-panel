"use client";

import { memo, useMemo } from "react";
import { NodeProps } from "reactflow";
import { useFlowStore } from "@/features/bot-constructor/store";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ReplyButtonTriggerData } from "./types";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { SourceHandles, TargetHandles } from "../../components";
import { Checkbox } from "@/components/ui/checkbox";
import { NodeHeader } from "../../actions/shared/NodeHeader";
import {
  ButtonConfig,
  KeyboardConfig,
} from "@/features/bot-constructor/components";
import { StateConfigUI, getStateTypesForReplyButtonTrigger } from "../shared";
import { useNodeCollapsed } from "@/features/bot-constructor/hooks/useNodeCollapsed";

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
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const [isCollapsed, setIsCollapsed] = useNodeCollapsed();

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
    // Agar tugma tanlansa, "catchNoButton" ni o'chirib qo'yamiz
    updateNodeData(id, {
      selectedButton: selectedButtonObject,
      catchNoButton: false,
    });
  };

  const isConfigured = !!data.selectedButtons || !!data.catchNoButton;

  function handleToggle(isChecked: boolean, button: ButtonConfig) {
    if (isChecked) {
      // Tugma tanlangan bo'lsa, selectedButtons ga qo'shamiz
      const selectedButtonObject = availableReplyButtons.find(
        (btn) => btn.id === button.id
      );

      const updatedButtons = data.selectedButtons
        ? [...data.selectedButtons, selectedButtonObject!]
        : [selectedButtonObject!];

      updateNodeData(id, {
        selectedButtons: updatedButtons,
        catchNoButton: false,
      });
      return;
    } else {
      // Tugma tanlanmagan bo'lsa, selectedButtons dan olib tashlaymiz
      const updatedButtons = data.selectedButtons?.filter(
        (btn) => btn.id !== button.id
      );
      updateNodeData(id, {
        selectedButtons: updatedButtons,
      });
      return;
    }
  }

  const availableStateTypes = useMemo(() => {
    return getStateTypesForReplyButtonTrigger();
  }, []);

  const selectedButtonNames = data.selectedButtons?.map((b) => b.text).join(", ");

  return (
    <Card className={cn("w-[150px] shadow-lg", selected && "ring-2 ring-primary")}>
      <TargetHandles />

      <NodeHeader
        icon="↩️"
        title="Reply Tugma"
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {selectedButtonNames && (
        <div className="px-3 pb-2 text-xs font-mono text-primary truncate">
          {selectedButtonNames}
        </div>
      )}

      {!isCollapsed && (
        <CardContent className="flex flex-col gap-3">
          {!data.catchNoButton && (
            <>
              {availableReplyButtons.length > 0 ? (
                <div className="space-y-3">
                  <Label className="text-xs text-muted-foreground">
                    Qaysi tugma ushlansin?
                  </Label>

                  <div className="space-y-2">
                    {availableReplyButtons.map((button) => {
                      const uniqueId = `r-${id}-${button.id}`;
                      return (
                        <div key={uniqueId} className="flex items-center gap-3">
                          <Checkbox
                            // onChange={(e) => handleToggle(e, button)}
                            onCheckedChange={(toggle) =>
                              handleToggle(toggle as boolean, button)
                            }
                            checked={
                              data.selectedButtons?.some(
                                (btn) => btn.id === button.id
                              ) || false
                            }
                          />
                          <Label htmlFor={uniqueId}>{button.text}</Label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center text-sm text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>
                    Iltimos, bu nodeni Reply-tugmalari mavjud bo'lgan node'ga
                    ulang.
                  </span>
                </div>
              )}
            </>
          )}

          {data.catchNoButton && (
            <div className="p-3 text-center text-sm text-blue-500 bg-blue-500/10 border border-blue-500/20 rounded-md flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span>
                Bu node hech qanday tugma bosilmagan holda kelgan xabarlarni tutib
                oladi.
              </span>
            </div>
          )}

          <div className="space-y-2 mt-2">
            <Label className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={data.catchNoButton || false}
                onCheckedChange={(e) =>
                  updateNodeData(id, {
                    catchNoButton: e as boolean,
                    // Agar "hech qanday tugma bosilmasa" tanlansa, tanlangan tugmani tozalash
                    ...(e && { selectedButton: undefined }),
                  })
                }
              />
              <span>Hech qanday tugma bosilmasa ham tutib ol</span>
            </Label>

            <Label className="flex items-center gap-2 cursor-pointer">
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
          </div>

          {/* State Configuration */}
          <StateConfigUI
            state={data.state}
            onStateChange={(state) => updateNodeData(id, { state })}
            availableTypes={availableStateTypes}
            nodeId={id}
          />
        </CardContent>
      )}
      <SourceHandles nodeId={id} />
    </Card>
  );
};

export const ReplyButtonTriggerNode = memo(ReplyButtonTriggerNodeComponent);
